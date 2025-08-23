"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Monitor,
    Plus,
    ExternalLink,
    Trash2,
    Activity,
    Search,
    Filter,
    RefreshCw,
    Globe,
    CheckCircle,
    XCircle,
    AlertTriangle,
    MoreVertical,
    Eye,
    Edit,
    Settings,
    Bell,
    User
} from "lucide-react";

interface Website {
    id: string;
    url: string;
    time_added: string;
    status?: 'up' | 'down' | 'checking';
    uptime?: number;
    response_time?: number;
    last_checked?: string;
    incidents?: number;
}

const Dashboard = () => {
    const router = useRouter();
    const [websites, setWebsites] = useState<Website[]>([]);
    const [newWebsiteUrl, setNewWebsiteUrl] = useState("");
    const [isAddingWebsite, setIsAddingWebsite] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    useEffect(() => {
        fetchWebsites();

        // Set up auto-refresh every 30 seconds only if enabled
        if (autoRefresh) {
            const interval = setInterval(() => {
                console.log('🔄 Auto-refreshing dashboard data...');
                fetchWebsites();
                setLastRefresh(new Date());
            }, 30 * 1000); // 30 seconds

            // Cleanup interval on component unmount
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const fetchWebsites = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/signin';
            return;
        }

        try {
            const response = await fetch('/api/websites', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                // Use real data from the database
                const websitesWithRealData = (data.websites || []).map((website: Website) => ({
                    ...website,
                    status: 'checking', // Default status until we get real data
                    uptime: 0, // Will be calculated from ticks
                    response_time: 0,
                    last_checked: 'Never',
                    incidents: 0
                }));
                setWebsites(websitesWithRealData);

                // Fetch status for each website to get real monitoring data
                const statusPromises = websitesWithRealData.map(async (website: Website) => {
                    try {
                        const statusResponse = await fetch(`/api/status/${website.id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        });

                        if (statusResponse.ok) {
                            const statusData = await statusResponse.json();
                            return {
                                websiteId: website.id,
                                statusData
                            };
                        }
                    } catch (error) {
                        console.error(`Error fetching status for ${website.url}:`, error);
                    }
                    return null;
                });

                // Wait for all status requests to complete
                const statusResults = await Promise.all(statusPromises);

                console.log('Status results:', statusResults);

                // Update websites with real data
                setWebsites(prev => prev.map(w => {
                    const statusResult = statusResults.find(r => r?.websiteId === w.id);
                    if (statusResult?.statusData) {
                        const ticks = statusResult.statusData.ticks || [];
                        const latestTick = ticks[0];

                        console.log(`Website ${w.url}:`, {
                            ticks: ticks.length,
                            latestTick,
                            status: latestTick?.status,
                            responseTime: latestTick?.response_time
                        });

                        return {
                            ...w,
                            status: latestTick?.status?.toLowerCase() || 'unknown', // Convert "Up" to "up"
                            response_time: latestTick?.response_time || 0,
                            last_checked: latestTick?.createdAt
                                ? new Date(latestTick.createdAt).toLocaleString()
                                : 'Never',
                            uptime: ticks.length > 0
                                ? (ticks.filter((t: any) => t.status?.toLowerCase() === 'up').length / ticks.length) * 100
                                : 0
                        };
                    }
                    return w;
                }));
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/signin';
            }
        } catch (error) {
            console.error('Error fetching websites:', error);
        }
    };

    const addWebsite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWebsiteUrl.trim()) return;

        setIsAddingWebsite(true);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('/api/website', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ url: newWebsiteUrl }),
            });

            if (response.ok) {
                const data = await response.json();
                setNewWebsiteUrl("");
                setShowAddForm(false);
                fetchWebsites();
                alert(`Website "${data.url}" added successfully!`);
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || 'Failed to add website. Please try again.';
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Error adding website:', error);
            alert('Network error. Please check your connection and try again.');
        } finally {
            setIsAddingWebsite(false);
        }
    };

    const handleRefresh = async () => {
        await fetchWebsites();
        setLastRefresh(new Date());
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'up':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'down':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'checking':
                return <Activity className="h-4 w-4 text-yellow-500 animate-spin" />;
            default:
                return <AlertTriangle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'up':
                return 'text-green-500';
            case 'down':
                return 'text-red-500';
            case 'checking':
                return 'text-yellow-500';
            default:
                return 'text-gray-500';
        }
    };

    const getUptimeColor = (uptime: number) => {
        if (uptime >= 99) return 'bg-green-500';
        if (uptime >= 95) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const filteredWebsites = websites.filter(website =>
        website.url.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sitesUp = websites.filter(w => w.status === 'up').length;
    const sitesDown = websites.filter(w => w.status === 'down').length;
    const avgUptime = websites.length > 0
        ? (websites.reduce((sum, w) => sum + (w.uptime || 0), 0) / websites.length).toFixed(2)
        : '0.00';

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Header */}
            <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <Monitor className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-white">BetterStack</span>
                            </div>
                            <nav className="hidden md:flex items-center space-x-6">
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">Dashboard</a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">Status Pages</a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">Incidents</a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">Reports</a>
                            </nav>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm">
                                <Bell className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                                <User className="h-4 w-4 mr-2" />
                                Account
                            </Button>
                            <Button variant="ghost" onClick={handleSignOut}>
                                Sign Out
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    console.log('Current websites:', websites);
                                    console.log('Checking if worker is running...');
                                    alert('Check the browser console for website data and worker status');
                                }}
                            >
                                Debug
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Total Sites</p>
                                    <p className="text-2xl font-bold text-white">{websites.length}</p>
                                </div>
                                <Globe className="h-8 w-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Sites Up</p>
                                    <p className="text-2xl font-bold text-green-500">{sitesUp}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Sites Down</p>
                                    <p className="text-2xl font-bold text-red-500">{sitesDown}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Avg Uptime</p>
                                    <p className="text-2xl font-bold text-white">{avgUptime}%</p>
                                </div>
                                <div className="h-8 w-8 text-purple-400">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                                    </svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search, Filter, and Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search websites..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                        />
                    </div>
                    <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                        <Filter className="h-4 w-4 mr-2" />
                        All Status
                    </Button>
                    <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800" onClick={handleRefresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Website
                    </Button>
                    <Button
                        variant={autoRefresh ? "default" : "outline"}
                        className={`${autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}`}
                        onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                        {autoRefresh ? '🔄 Auto-Refresh ON' : '⏸️ Auto-Refresh OFF'}
                    </Button>
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                        <span>Last refresh: {lastRefresh.toLocaleTimeString()}</span>
                        {autoRefresh && (
                            <div className="flex items-center gap-1 text-green-400">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span>Auto-refreshing every 30s</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Website Form */}
                {showAddForm && (
                    <Card className="mb-6 bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-white">Add New Website</CardTitle>
                            <CardDescription className="text-gray-400">
                                Enter a URL to start monitoring
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={addWebsite} className="flex gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="website-url" className="sr-only">Website URL</Label>
                                    <Input
                                        id="website-url"
                                        type="url"
                                        placeholder="https://example.com"
                                        value={newWebsiteUrl}
                                        onChange={(e) => setNewWebsiteUrl(e.target.value)}
                                        required
                                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={isAddingWebsite}
                                >
                                    {isAddingWebsite ? (
                                        <>
                                            <Activity className="h-4 w-4 animate-spin mr-2" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Website
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Websites Table */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Monitored Websites</CardTitle>
                        <CardDescription className="text-gray-400">
                            {filteredWebsites.length} website{filteredWebsites.length !== 1 ? 's' : ''} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredWebsites.length === 0 ? (
                            <div className="text-center py-12">
                                <Monitor className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-400 mb-2">No websites found</h3>
                                <p className="text-gray-500">
                                    {searchQuery ? 'Try adjusting your search terms' : 'Add your first website to start monitoring'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Website</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Uptime</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Response</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Last Checked</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Incidents</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredWebsites.map((website) => (
                                            <tr key={website.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                                <td className="py-4 px-4">
                                                    <div>
                                                        <p className="font-medium text-white">{website.url}</p>
                                                        <p className="text-sm text-gray-400">ID: {website.id}</p>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(website.status || 'unknown')}
                                                        <span className={`font-medium ${getStatusColor(website.status || 'unknown')}`}>
                                                            {website.status?.toUpperCase() || 'UNKNOWN'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-white font-medium">{website.uptime?.toFixed(2)}%</span>
                                                        <div className="w-16 bg-gray-700 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${getUptimeColor(website.uptime || 0)}`}
                                                                style={{ width: `${website.uptime || 0}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="text-white">
                                                        {website.response_time ? `${website.response_time}ms` : '-'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="text-gray-400">{website.last_checked || 'Never'}</span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    {website.incidents && website.incidents > 0 ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-red-200">
                                                            △ {website.incidents}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">0</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => router.push(`/website/${website.id}`)}
                                                            className="text-blue-400 hover:text-blue-300"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => window.open(website.url, '_blank')}
                                                            className="text-green-400 hover:text-green-300"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-gray-400 hover:text-gray-300"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-400 hover:text-red-300"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-gray-400 hover:text-gray-300"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
