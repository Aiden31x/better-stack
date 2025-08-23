"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, ArrowLeft, Activity, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface Website {
    id: string;
    url: string;
    user_id: string;
    ticks?: Array<{
        id: string;
        status: string;
        response_time: number;
        createdAt: string;
    }>;
}

const WebsiteDetail = () => {
    const params = useParams();
    const router = useRouter();
    const [website, setWebsite] = useState<Website | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWebsiteStatus = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/signin');
            return;
        }

        try {
            const response = await fetch(`/api/status/${params.websiteId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setWebsite(data);
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                router.push('/signin');
            } else {
                setError('Website not found or access denied');
            }
        } catch (error) {
            console.error('Error fetching website status:', error);
            setError('Failed to fetch website status');
        } finally {
            setIsLoading(false);
        }
    }, [params.websiteId, router]);

    useEffect(() => {
        fetchWebsiteStatus();
    }, [fetchWebsiteStatus]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'up':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'down':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'up':
                return 'text-green-500';
            case 'down':
                return 'text-red-500';
            default:
                return 'text-yellow-500';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Activity className="h-12 w-12 text-green-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading website status...</p>
                </div>
            </div>
        );
    }

    if (error || !website) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">{error || 'Website not found'}</p>
                    <Button onClick={() => router.push('/dashboard')} className="bg-gradient-to-r from-green-600 to-green-400 text-black">
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Header */}
            <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.push('/dashboard')}
                                className="text-gray-400 hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-600 to-green-400 flex items-center justify-center">
                                <Monitor className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">BetterStack</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Website Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">{website.url}</h1>
                    <p className="text-gray-400">Website ID: {website.id}</p>
                </div>

                {/* Status Overview */}
                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center">
                                <Activity className="h-5 w-5 mr-2" />
                                Current Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                {getStatusIcon(website.ticks?.[0]?.status || 'unknown')}
                                <span className={`font-semibold ${getStatusColor(website.ticks?.[0]?.status || 'unknown')}`}>
                                    {website.ticks?.[0]?.status?.toUpperCase() || 'UNKNOWN'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center">
                                <Clock className="h-5 w-5 mr-2" />
                                Response Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-white">
                                {website.ticks?.[0]?.response_time || 'N/A'}ms
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center">
                                <Monitor className="h-5 w-5 mr-2" />
                                Total Checks
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-white">{website.ticks?.length || 0}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Checks */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Monitoring Checks</CardTitle>
                        <CardDescription className="text-gray-400">
                            Latest uptime monitoring results
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!website.ticks || website.ticks.length === 0 ? (
                            <div className="text-center py-8">
                                <Monitor className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No monitoring data available yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {website.ticks.map((tick) => (
                                    <div key={tick.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            {getStatusIcon(tick.status)}
                                            <div>
                                                <p className={`font-medium ${getStatusColor(tick.status)}`}>
                                                    {tick.status.toUpperCase()}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {new Date(tick.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-medium">{tick.response_time}ms</p>
                                            <p className="text-sm text-gray-400">Response Time</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default WebsiteDetail;
