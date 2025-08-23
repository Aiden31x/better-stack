"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Monitor,
  Shield,
  Zap,
  BarChart,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Navbar */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-600 to-green-400 flex items-center justify-center">
                <Monitor className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BetterStack</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
              <a href="#docs" className="text-gray-400 hover:text-white transition-colors">Docs</a>
              <a href="#blog" className="text-gray-400 hover:text-white transition-colors">Blog</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-green-600 to-green-400 text-black" size="sm">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0">
          <Image
            src="/mountains.jpg"
            alt="Background"
            fill
            className="object-cover opacity-10"
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-24 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white">
              Monitor and Protect Your Infrastructure
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-400">
              Reliable monitoring and incident management platform built for modern teams.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-400 text-black">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                Book a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 sm:py-32 bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Everything you need</h2>
            <p className="mt-4 text-lg text-gray-400">
              All-in-one monitoring and incident management platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-lg">
              <CardContent className="p-6">
                <div className="rounded-lg bg-gradient-to-r from-green-600 to-green-400 w-12 h-12 flex items-center justify-center mb-4">
                  <Monitor className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Uptime Monitoring</h3>
                <p className="mt-2 text-gray-400">Track availability with instant alerts and beautiful status pages.</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-lg">
              <CardContent className="p-6">
                <div className="rounded-lg bg-gradient-to-r from-green-600 to-green-400 w-12 h-12 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Incident Management</h3>
                <p className="mt-2 text-gray-400">Resolve incidents faster with automated escalations and workflows.</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-lg">
              <CardContent className="p-6">
                <div className="rounded-lg bg-gradient-to-r from-green-600 to-green-400 w-12 h-12 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">On-Call Scheduling</h3>
                <p className="mt-2 text-gray-400">Manage on-call shifts with flexible scheduling and notifications.</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-lg">
              <CardContent className="p-6">
                <div className="rounded-lg bg-gradient-to-r from-green-600 to-green-400 w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Analytics & Reports</h3>
                <p className="mt-2 text-gray-400">Gain insights with detailed analytics and incident reports.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-6">Join thousands of teams already using BetterStack</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-400 text-black">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/signin">
              <Button size="lg" variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
