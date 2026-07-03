import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import { type DocumentationRecord, unwrapList } from '../../features/studentOjt/apiTypes';

export default function DocumentationPage() {
  const [records, setRecords] = useState<DocumentationRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => client.get('/documentation-files')
    .then((response) => setRecords(unwrapList<DocumentationRecord>(response.data)))
    .catch(() => setError('Documentation could not be loaded.'))
    .finally(() => setLoading(false));

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => !query
      || record.title.toLowerCase().includes(query)
      || record.description.toLowerCase().includes(query));
  }, [records, search]);

  const remove = async (record: DocumentationRecord) => {
    if (!window.confirm(`Delete “${record.title}”? This cannot be undone.`)) return;
    try {
      await client.delete(`/documentation-files/${record.id}`);
      setRecords((current) => current.filter((item) => item.id !== record.id));
    } catch {
      setError('The documentation item could not be deleted.');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="OJT Documentation"
        description="Private evidence attached to your authenticated attendance and reports."
        actions={<Link to="/app/documents/upload" className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">Upload or capture photo</Link>}
      />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block max-w-xl">
          <span className="sr-only">Search documentation</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or description" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm" />
        </label>
      </section>

      {error ? <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</div> : null}
      {loading ? <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading documentation…</div> : null}

      {!loading && filtered.length ? (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((record) => (
            <article key={record.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <SecureImage record={record} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><h2 className="font-bold text-slate-900">{record.title}</h2><p className="mt-1 text-xs text-slate-500">{new Date(record.taken_at).toLocaleString()}</p></div>
                  <button type="button" onClick={() => remove(record)} className="text-sm font-semibold text-rose-700 hover:text-rose-900">Delete</button>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{record.description}</p>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {!loading && !filtered.length ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
          {records.length ? 'No documentation matches your search.' : 'No documentation uploaded yet.'}
        </div>
      ) : null}
    </div>
  );
}

function SecureImage({ record }: { record: DocumentationRecord }) {
  const [source, setSource] = useState('');
  useEffect(() => {
    let objectUrl = '';
    client.get(record.download_url, { responseType: 'blob' }).then((response) => {
      objectUrl = URL.createObjectURL(response.data);
      setSource(objectUrl);
    }).catch(() => setSource(''));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [record.download_url]);

  return source
    ? <img src={source} alt={record.title} className="h-52 w-full object-cover" />
    : <div className="flex h-52 items-center justify-center bg-slate-100 text-sm text-slate-500">Private image preview</div>;
}
