'use client';

import { BarChart3, Calendar, Utensils } from "lucide-react";
import { useState } from "react";

export default function Statistics() {
    const [stats] = useState({
        totalItems: 12,
        expiringSoon: 3,
        expired: 1,
        recipesGenerated: 8
      });
    return (<>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Items</dt>
                                <dd className="text-lg font-medium text-gray-900">{stats.totalItems}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Expiring Soon</dt>
                                <dd className="text-lg font-medium text-gray-900">{stats.expiringSoon}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Expired</dt>
                                <dd className="text-lg font-medium text-gray-900">{stats.expired}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                <Utensils className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Recipes Generated</dt>
                                <dd className="text-lg font-medium text-gray-900">{stats.recipesGenerated}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}