import React from 'react'
import AppShell from "../../../AppShell";

export default function realServerDecorator(Story: React.ComponentType) {
  return (
    <AppShell>
      <Story />
    </AppShell>
  )
}
