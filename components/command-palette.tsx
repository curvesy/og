'use client'

import { useState, useEffect } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Button } from './ui/button'
import { CommandIcon, Search } from 'lucide-react'

export function CommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full p-0 shadow-lg"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
      >
        <CommandIcon className="h-6 w-6" />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <span>Search Agents...</span>
            </CommandItem>
            <CommandItem>
              <span>View Live Feed</span>
            </CommandItem>
            <CommandItem>
              <span>Open MCP Console</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <span>Profile</span>
            </CommandItem>
            <CommandItem>
              <span>Billing</span>
            </CommandItem>
            <CommandItem>
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
