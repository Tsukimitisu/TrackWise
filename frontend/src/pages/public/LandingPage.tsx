import { Link } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import Button from '../../components/ui/Button';

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50 text-slate-900">
			{/* Navigation */}
			<nav className="sticky top-0 z-40 border-b border-blue-100/80 bg-white/85 shadow-sm backdrop-blur-md">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
					<Link to="/" className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-sm font-bold text-white shadow-sm">TW</div>
						<div>
							<span className="block font-bold text-lg tracking-tight text-slate-900">TrackWise</span>
							<span className="block text-xs text-slate-500">Track work with clarity</span>
						</div>
					</Link>
					<div className="flex items-center gap-4">
						<ThemeToggle />
						<Link to="/login" className="hidden sm:inline-flex px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors">
							Sign in
						</Link>
						<Link to="/register" className="px-4 py-2.5 rounded-xl bg-blue-600 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
							Get Started
						</Link>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20 sm:py-32 lg:py-48">
				{/* Gradient background */}
				<div className="absolute inset-0 -z-10">
					<div className="absolute top-40 right-40 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl animate-pulse" />
					<div className="absolute bottom-40 left-40 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
				</div>

				<div className="mx-auto max-w-7xl text-center">
					{/* Eyebrow */}
					<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
						<span className="h-2 w-2 rounded-full bg-success animate-pulse"></span>
						<span className="text-sm font-medium text-slate-600">Now live for all organizations</span>
					</div>

					{/* Headline */}
					<h1 className="mx-auto mb-6 max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900">
						Effortless work tracking for{' '}
						<span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
							modern teams
						</span>
					</h1>

					{/* Subheadline */}
					<p className="mx-auto mb-10 max-w-2xl text-xl text-slate-600">
						Track attendance, manage time-ins, submit reports, and oversee progress all in one beautiful platform. Built for OJTs, interns, employees, and freelancers.
					</p>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
						<Link to="/register" className="px-6 py-3 rounded-xl bg-blue-600 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
							Start Free Trial
						</Link>
						<a href="#features" className="px-6 py-3 rounded-xl border border-blue-200 bg-white text-sm font-medium text-slate-800 transition-colors hover:bg-blue-50 hover:border-blue-300">
							Learn More
						</a>
					</div>

					{/* Hero Image */}
					<div className="mx-auto max-w-4xl">
						<div className="rounded-3xl border border-blue-100 bg-white p-2 shadow-[0_25px_80px_rgba(59,130,246,0.15)]">
							<div className="aspect-video flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50">
								<div className="text-center space-y-3">
									<svg className="h-16 w-16 mx-auto text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
									</svg>
									<p className="text-sm text-slate-500">Dashboard Preview</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section id="features" className="relative px-4 sm:px-6 lg:px-8 py-24 bg-white">
				<div className="mx-auto max-w-7xl">
					<div className="text-center mb-16">
						<h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
							Powerful features
						</h2>
						<p className="text-xl text-slate-600 max-w-2xl mx-auto">
							Everything you need to manage work tracking efficiently
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[
							{
								icon: '⏱️',
								title: 'Time Tracking',
								description: 'Clock in and out with photo proof. Real-time attendance validation.',
							},
							{
								icon: '📊',
								title: 'Smart Reports',
								description: 'Daily and weekly reports with approval workflows. Auto-calculations.',
							},
							{
								icon: '📸',
								title: 'Media Upload',
								description: 'Attach photos and documents. Optional GPS location tracking.',
							},
							{
								icon: '✅',
								title: 'Approval System',
								description: 'Multi-level approvals with audit trails and revision tracking.',
							},
							{
								icon: '📈',
								title: 'Analytics',
								description: 'Track progress, hours completed, and completion percentages.',
							},
							{
								icon: '🏢',
								title: 'Multi-Organization',
								description: 'Manage multiple organizations with complete data isolation.',
							},
						].map((feature, i) => (
							<div key={i} className="group rounded-2xl border border-blue-100 p-8 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-lg bg-white">
								<div className="text-4xl mb-4">{feature.icon}</div>
								<h3 className="text-lg font-semibold text-slate-900 mb-2">
									{feature.title}
								</h3>
								<p className="text-slate-600">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Roles Section */}
			<section className="relative px-4 sm:px-6 lg:px-8 py-24">
				<div className="mx-auto max-w-7xl">
					<div className="text-center mb-16">
						<h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
							Designed for everyone
						</h2>
						<p className="text-xl text-slate-600 max-w-2xl mx-auto">
							From students to supervisors, everyone has the right tools
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{[
							{ role: 'Students & Interns', icon: '👨‍🎓', description: 'Track hours, submit reports, upload documents' },
							{ role: 'Supervisors', icon: '👔', description: 'Review and approve submissions' },
							{ role: 'Coordinators', icon: '📋', description: 'Monitor progress and generate insights' },
							{ role: 'Admins', icon: '⚙️', description: 'Manage organizations and users' },
						].map((role, i) => (
							<div key={i} className="rounded-xl border border-blue-100 p-6 text-center bg-white shadow-sm">
								<div className="text-5xl mb-3">{role.icon}</div>
								<h3 className="font-semibold text-slate-900 mb-2">{role.role}</h3>
								<p className="text-sm text-slate-600">{role.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="relative px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-r from-blue-600 to-sky-500">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
						Ready to simplify work tracking?
					</h2>
					<p className="text-xl text-blue-50 mb-10 max-w-2xl mx-auto">
						Join teams that are already using TrackWise to streamline their workflow
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Link to="/register" className="px-6 py-3 rounded-xl bg-white text-blue-700 text-sm font-medium shadow-sm transition-colors hover:bg-blue-50">
							Get Started Free
						</Link>
						<Link to="/login" className="px-6 py-3 rounded-xl text-white text-sm font-medium transition-colors hover:bg-white/10">
							Sign In
						</Link>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-blue-100 bg-white px-4 sm:px-6 lg:px-8 py-12">
				<div className="mx-auto max-w-7xl">
					<div className="flex flex-col md:flex-row items-center justify-between gap-8">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-sm font-bold text-white shadow-sm">TW</div>
							<span className="font-bold text-lg text-slate-900">TrackWise</span>
						</div>
						<p className="text-sm text-slate-600 text-center md:text-right">
							© 2026 TrackWise. All rights reserved.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}

