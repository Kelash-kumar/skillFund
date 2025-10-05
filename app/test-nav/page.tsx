import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function TestNavigation() {
  const router = useRouter()

  useEffect(() => {
    console.log('Router available:', !!router)
    console.log('Router methods:', Object.keys(router))
  }, [router])

  const testNavigation = () => {
    console.log('Testing navigation...')
    try {
      router.push('/admin/applications/68e17a43d9991531150a5815')
      console.log('Navigation called successfully')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Navigation Test</h1>
      <button onClick={testNavigation}>Test Navigation</button>
    </div>
  )
}