'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GelatoStatusPanel } from '@/components/gelato/GelatoStatusPanel';
import { OracleStatusPanel } from '@/components/oracle/OracleStatusPanel';
import { Settings, Zap, Brain } from 'lucide-react';
import { AutoRefreshBanner } from '@/components/common/AutoRefreshBanner';

export default function AdminPage() {
  return (
    <div className="min-h-screen text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Monitor system status and automation services
          </p>
        </div>

        {/* Auto-refresh Banner */}
        <AutoRefreshBanner
          refreshInterval={60}
          onRefresh={async () => {
            // Refresh admin status data
            window.location.reload();
          }}
          description="Admin dashboard is automatically refreshed to show the latest system status, Gelato automation tasks, and Oracle health metrics."
          sectionName="Admin Dashboard"
          className="mb-4 sm:mb-6"
        />

        <Tabs defaultValue="status" className="space-y-6">
          <TabsList>
            <TabsTrigger value="status">System Status</TabsTrigger>
            <TabsTrigger value="gelato">Gelato</TabsTrigger>
            <TabsTrigger value="oracle">Oracle</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-6">
            <GelatoStatusPanel />
            <OracleStatusPanel />
          </TabsContent>

          <TabsContent value="gelato">
            <GelatoStatusPanel />
          </TabsContent>

          <TabsContent value="oracle">
            <OracleStatusPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

