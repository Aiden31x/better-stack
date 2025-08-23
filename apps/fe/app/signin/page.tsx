"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SignIn = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        try {
            const response = await fetch('/api/user/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                // Store the JWT token in localStorage
                localStorage.setItem('token', data.jwt);
                // Redirect to dashboard after successful signin
                window.location.href = '/dashboard';
            } else {
                alert('Invalid username or password.');
            }
        } catch (error) {
            console.error('Signin error:', error);
            alert('An error occurred during signin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-gray-800 border-gray-700">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-white">Sign In</CardTitle>
                    <CardDescription className="text-center text-gray-400">
                        Welcome back! Sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-400 text-black hover:from-green-700 hover:to-green-500" disabled={isLoading}>
                            {isLoading ? "Signing In..." : "Sign In"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm text-gray-400">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-green-400 hover:text-green-300 underline">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SignIn;
