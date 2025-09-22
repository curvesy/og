'use client'

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HardDrive, Wrench, Bot, Clock, Shield } from 'lucide-react';

export default function McpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-64 flex flex-col border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <Bot className="mr-2" /> MCP Console
          </h2>
        </div>
        <nav className="flex flex-col p-4 space-y-2">
          <Button asChild variant="ghost" className="justify-start transition-colors hover:bg-accent">
            <Link href="/mcp/servers">
              <HardDrive className="mr-2 h-4 w-4" />
              Servers
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start transition-colors hover:bg-accent">
            <Link href="/mcp/tools">
              <Wrench className="mr-2 h-4 w-4" />
              Tools
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start transition-colors hover:bg-accent">
            <Link href="/mcp/sessions">
              <Clock className="mr-2 h-4 w-4" />
              Sessions
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start transition-colors hover:bg-accent">
            <Link href="/mcp/policies">
              <Shield className="mr-2 h-4 w-4" />
              Policies
            </Link>
          </Button>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
