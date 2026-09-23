import { Route, Routes } from 'react-router'

import { ToastProvider } from './components/feedback/ToastProvider'
import { WorkItemsPage } from './pages/WorkItemsPage'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<WorkItemsPage />} />
        {/* Deep links to a single item reuse the same page; the panel opens
            from the `item` search param. */}
        <Route path="/work-items" element={<WorkItemsPage />} />
      </Routes>
    </ToastProvider>
  )
}
