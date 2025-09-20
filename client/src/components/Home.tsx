import { useEffect, useState, useMemo } from "react";
import beaver from "@/assets/beaver.svg";
import { Button } from "@/components/ui/button";
import { hcWithType } from "server/dist/client";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { useAuth } from '@/components/auth/use-auth';
import { Lottie } from '@/components/visual/Lottie';
import socialNetworkAnimation from '@/assets/animations/social media network.json';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

// Minimal strongly-typed shim for hello endpoint to avoid 'unknown' complaints
const rawClient = hcWithType(SERVER_URL) as unknown;
interface HelloData { message: string; success: boolean }
interface HelloCall { ok: boolean; json: () => Promise<HelloData> }
const client = {
	hello: {
		$get: async () => {
			const possible = rawClient as { hello?: { $get?: () => Promise<unknown> } };
			const result = await possible.hello?.$get?.();
			return result as HelloCall;
		}
	}
};

function Home() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [data, setData] = useState<HelloData | undefined>();

	// If already authenticated, move to dashboard automatically
	useEffect(() => {
		if (user) navigate('/dashboard');
	}, [user, navigate]);

	const { mutate: sendRequest, isPending } = useMutation({
		mutationFn: async () => {
			try {
				const res = await client.hello.$get();
				if (!res.ok) return;
				const d = await res.json();
				setData(d);
			} catch (error) {
				console.log(error);
			}
		},
	});

	if (user) {
		// brief placeholder while redirect effect runs
		return <div className="p-8 text-center">Redirecting to your dashboard...</div>;
	}

	return (
		<div className="min-h-screen flex flex-col">
			<header className="w-full py-6 border-b backdrop-blur bg-background/50">
				<div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<img src={beaver} className="w-10 h-10" alt="logo" />
						<span className="text-2xl font-bold tracking-tight">bhvr social</span>
					</div>
					<nav className="flex items-center gap-3">
						<Button variant="ghost" asChild><Link to="/login">Login</Link></Button>
						<Button asChild><Link to="/register">Get Started</Link></Button>
					</nav>
				</div>
			</header>
			<main className="flex-1 flex flex-col">
				{/* Hero Section with Animation */}
				<section className="flex-1 flex items-center">
					<div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center py-16">
						<div className="space-y-6">
							<h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
								Your evolving social learning hub.
							</h1>
							<p className="text-lg text-muted-foreground max-w-prose">
								Connect, collaborate and personalize your space with secure accounts, role‑based dashboards and upcoming interactive features.
							</p>
							<div className="flex flex-wrap gap-4">
								<Button size="lg" asChild><Link to="/register">Create your account</Link></Button>
								<Button size="lg" variant="outline" asChild><Link to="/login">Sign in</Link></Button>
								<Button variant="secondary" onClick={() => sendRequest()} disabled={isPending}>{isPending ? 'Calling…' : 'Test API'}</Button>
							</div>
							{data && (
								<div className="rounded border p-3 bg-muted/40 text-sm font-mono">
									<div>message: {data.message}</div>
									<div>success: {data.success.toString()}</div>
								</div>
							)}
						</div>
						<div className="relative">
							<div className="aspect-square rounded-xl border glass shadow-lg overflow-hidden group">
								<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5" />
								<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[radial-gradient(circle_at_30%_30%,var(--accent)/10%,transparent_60%)]" />
								<Lottie 
									animationData={socialNetworkAnimation as object} 
									className="w-full h-full" 
									loop={true}
									autoplay={true}
								/>
							</div>
						</div>
					</div>
				</section>
				
				{/* Animated Features Rectangle Section */}
				<section className="border-t border-b py-20 bg-gradient-to-br from-muted/5 via-background to-muted/10 relative overflow-hidden">
					{/* Background decoration */}
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--primary)/2%,transparent_70%)]" />
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,var(--accent)/2%,transparent_70%)]" />
					
					<div className="max-w-6xl mx-auto px-6 relative z-10">
						<div className="text-center mb-16">
							<h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-navy-300">Planned & Live Features</h2>
							<p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">Experience the power of social learning with our evolving feature set</p>
						</div>
						<div className="relative max-w-4xl mx-auto">
							{/* Enhanced glass container with better shadows */}
							<div className="relative bg-gradient-to-br from-background/95 via-background/90 to-background/95 rounded-3xl border border-primary/10 glass shadow-2xl overflow-hidden backdrop-blur-xl">
								{/* Subtle gradient overlays */}
								<div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,var(--primary)/3%,transparent_60%)]" />
								<div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,var(--accent)/2%,transparent_60%)]" />
								
								{/* Content container with better padding */}
								<div className="relative z-10 p-12 md:p-16">
									<RotatingFeatures />
								</div>
								
								{/* Bottom highlight border */}
								<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
							</div>
						</div>
					</div>
				</section>
				<section className="py-16 bg-muted/10">
					<div className="max-w-6xl mx-auto px-6">
						<div className="text-center mb-12">
							<h2 className="text-2xl font-bold tracking-tight mb-4">Why Choose Our Platform?</h2>
							<p className="text-muted-foreground max-w-2xl mx-auto">Built with modern technology and user experience in mind</p>
						</div>
						<div className="grid md:grid-cols-3 gap-8">
							<div className="text-center space-y-4 p-6 rounded-xl glass border shadow-sm hover:shadow-md transition-shadow">
								<div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center">
									<span className="text-2xl">🛡️</span>
								</div>
								<h3 className="font-semibold text-lg">Enterprise Security</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">JWT authentication, role-based access control, and secure session management protect your data.</p>
							</div>
							<div className="text-center space-y-4 p-6 rounded-xl glass border shadow-sm hover:shadow-md transition-shadow">
								<div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 flex items-center justify-center">
									<span className="text-2xl">⚡</span>
								</div>
								<h3 className="font-semibold text-lg">Lightning Fast</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">Built with Bun runtime and modern architecture for optimal performance and instant responses.</p>
							</div>
							<div className="text-center space-y-4 p-6 rounded-xl glass border shadow-sm hover:shadow-md transition-shadow">
								<div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 flex items-center justify-center">
									<span className="text-2xl">🎨</span>
								</div>
								<h3 className="font-semibold text-lg">Modern Design</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">Clean, accessible interface with glass morphism effects and thoughtful user experience design.</p>
							</div>
						</div>
					</div>
				</section>
			</main>
			<footer className="bg-gradient-to-br from-navy-700 via-navy-600 to-navy-800 text-navy-900 relative overflow-hidden">
				{/* Background decoration */}
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent_50%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.03),transparent_50%)]" />
				
				<div className="relative z-10">
					{/* Main footer content */}
					<div className="max-w-6xl mx-auto px-6 py-16">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
							{/* Brand section */}
							<div className="space-y-4">
								<div className="flex items-center gap-3">
									<img src={beaver} className="w-10 h-10 filter text-navy-700 brightness-0 invert" alt="logo" />
									<span className="text-2xl font-bold text-navy-300">bhvr social</span>
								</div>
								<p className="text-navy-300 text-sm leading-relaxed max-w-sm">
									Empowering learners through secure, interactive social learning experiences. Built for the future of education.
								</p>
								<div className="flex items-center gap-4 pt-2">
									<a href="#" className="text-navy-300 hover:text-navy-900 transition-colors p-2 rounded-lg hover:bg-white/10">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
											<path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
										</svg>
									</a>
									<a href="#" className="text-navy-300 hover:text-navy-900 transition-colors p-2 rounded-lg hover:bg-white/10">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
											<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
										</svg>
									</a>
									<a href="#" className="text-navy-300 hover:text-navy-900 transition-colors p-2 rounded-lg hover:bg-white/10">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
											<path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.083.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.749-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-12C24.007 5.367 18.641.001 12.017.001z" clipRule="evenodd" />
										</svg>
									</a>
									<a href="#" className="text-navy-300 hover:text-navy-900 transition-colors p-2 rounded-lg hover:bg-white/10">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
											<path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
										</svg>
									</a>
								</div>
							</div>

							{/* Product links */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-navy-900">Product</h3>
								<ul className="space-y-3">
									<li><a href="#features" className="text-navy-300 hover:text-navy-900 transition-colors text-sm">Features</a></li>
									<li><a href="#dashboards" className="text-navy-300 hover:text-navy-900 transition-colors text-sm">Dashboards</a></li>
									<li><a href="#security" className="text-navy-300 hover:text-navy-900 transition-colors text-sm">Security</a></li>
									<li><a href="#integrations" className="text-navy-300 hover:text-navy-900 transition-colors text-sm">Integrations</a></li>
									<li><a href="#api" className="text-navy-300 hover:text-navy-900 transition-colors text-sm">API Docs</a></li>
								</ul>
							</div>

							{/* Company links */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-navy-900">Company</h3>
								<ul className="space-y-3">
									<li><a href="#about" className="text-navy-300 hover:text-navy-900 transition-colors text-sm">About Us</a></li>
									<li><a href="#team" className="text-navy-300 hover:text-navy-900 transition-colors text-sm">Our Team</a></li>
									<li><a href="#careers" className="text-navy-300 hover:text-navy-900 transition-colors text-sm">Careers</a></li>
									<li><a href="#blog" className="text-navy-300 hover:text-navy-900 transition-colors text-sm">Blog</a></li>
									<li><a href="#press" className="text-navy-300 hover:text-navy-900 transition-colors text-sm">Press Kit</a></li>
								</ul>
							</div>

							{/* Support links */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-navy-900">Support</h3>
								<ul className="space-y-3">
									<li><a href="#contact" className="text-navy-300 hover:text-navy-900 transition-colors text-sm">Contact Us</a></li>
									<li><a href="#help" className="text-navy-300 hover:text-navy-900 transition-colors text-sm">Help Center</a></li>
									<li><a href="#community" className="text-navy-300 hover:text-navy-900 transition-colors text-sm">Community</a></li>
									<li><a href="#status" className="text-navy-300 hover:text-navy-900 transition-colors text-sm">System Status</a></li>
									<li><a href="#feedback" className="text-navy-300 hover:text-navy-900 transition-colors text-sm">Feedback</a></li>
								</ul>
							</div>
						</div>
					</div>

					{/* Bottom section */}
					<div className="border-t border-navy-500/30">
						<div className="max-w-6xl mx-auto px-6 py-6">
							<div className="flex flex-col md:flex-row items-center justify-between gap-4">
								<div className="flex items-center gap-6 text-sm text-navy-300">
									<span>© 2025 bhvr social. All rights reserved.</span>
									<a href="#privacy" className="hover:text-navy-900 transition-colors">Privacy Policy</a>
									<a href="#terms" className="hover:text-navy-900 transition-colors">Terms of Service</a>
									<a href="#cookies" className="hover:text-navy-900 transition-colors">Cookie Policy</a>
								</div>
								<div className="flex items-center gap-2 text-sm text-navy-200">
									<span>Built with</span>
									<span className="text-red-400">❤️</span>
									<span>using BHVR stack</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}

export default Home;

// Enhanced rotating feature messages component for rectangular showcase
function RotatingFeatures() {
	const features = useMemo(() => [
		{ title: 'Real-time Social Feed', desc: 'Share posts, interact with peers, and stay connected', icon: '📱', status: 'Coming Soon' },
		{ title: 'Role-based Dashboards', desc: 'Tailored experiences for students, professors, and admins', icon: '🎯', status: 'Active' },
		{ title: 'Secure Authentication', desc: 'JWT-based security with role-based access control', icon: '🔐', status: 'Active' },
		{ title: 'Profile Customization', desc: 'Personalize your space and showcase your identity', icon: '✨', status: 'Coming Soon' },
		{ title: 'Media Sharing', desc: 'Upload and share images, documents, and resources', icon: '📎', status: 'Coming Soon' },
		{ title: 'Smart Notifications', desc: 'Stay updated with real-time alerts and mentions', icon: '🔔', status: 'Coming Soon' },
	], []);
	
	const [index, setIndex] = useState(0);
	const [isTransitioning, setIsTransitioning] = useState(false);

	useEffect(() => {
		const id = setInterval(() => {
			setIsTransitioning(true);
			setTimeout(() => {
				setIndex(i => (i + 1) % features.length);
				setIsTransitioning(false);
			}, 200);
		}, 3000);
		return () => clearInterval(id);
	}, [features.length]);

	const currentFeature = features[index];

	return (
		<div className="relative w-full h-52 flex items-center justify-center overflow-hidden">
			<style>{`
				@keyframes smoothFadeIn { 
					0% { opacity: 0; transform: translateY(10px); }
					100% { opacity: 1; transform: translateY(0); }
				}
				@keyframes smoothFadeOut { 
					0% { opacity: 1; transform: translateY(0); }
					100% { opacity: 0; transform: translateY(-10px); }
				}
				@keyframes iconFloat { 
					0%, 100% { transform: translateY(0px); }
					50% { transform: translateY(-5px); }
				}
				@keyframes progressExpand {
					0% { width: 8px; }
					100% { width: 32px; }
				}
			`}</style>
			
			<div className={`text-center space-y-6 max-w-lg mx-auto transition-all duration-300 ease-out ${
				isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
			}`}>
				{/* Icon with float animation */}
				<div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border border-primary/20 glass shadow-lg flex items-center justify-center animate-[iconFloat_3s_ease-in-out_infinite]">
					<span className="text-3xl filter drop-shadow-sm">{currentFeature.icon}</span>
				</div>
				
				{/* Feature content */}
				<div className="space-y-4">
					<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
						<h3 className="text-xl font-bold tracking-tight text-navy-300">{currentFeature.title}</h3>
						<span className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm transition-colors ${
							currentFeature.status === 'Active' 
								? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200/60 shadow-sm' 
								: 'bg-sky-100/80 text-sky-700 border border-sky-200/60 shadow-sm'
						}`}>
							{currentFeature.status}
						</span>
					</div>
					<p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
						{currentFeature.desc}
					</p>
				</div>
				
				{/* Progress indicators with smooth animations */}
				<div className="flex gap-2 justify-center pt-2">
					{features.map((_, i) => (
						<button
							key={i}
							className={`h-2 rounded-full transition-all duration-500 ease-out hover:scale-110 ${
								i === index 
									? 'w-8 bg-gradient-to-r from-primary to-accent shadow-sm animate-[progressExpand_0.5s_ease-out]' 
									: 'w-2 bg-border/60 hover:bg-primary/40 hover:w-3'
							}`}
							onClick={() => {
								if (i !== index) {
									setIsTransitioning(true);
									setTimeout(() => {
										setIndex(i);
										setIsTransitioning(false);
									}, 150);
								}
							}}
							aria-label={`View feature ${i + 1}: ${features[i].title}`}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
