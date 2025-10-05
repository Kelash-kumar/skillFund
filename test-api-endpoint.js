// Test the unified API endpoint
async function testAPI() {
  try {
    console.log("🔍 Testing Unified Applications API");
    console.log("==================================");
    
    const response = await fetch("http://localhost:3000/api/admin/unified-applications", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log("Response Status:", response.status);
    console.log("Response Headers:", Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ API Response:", data);
      console.log(`📊 Found ${Array.isArray(data) ? data.length : 'unknown'} applications`);
    } else {
      const errorText = await response.text();
      console.log("❌ API Error:", errorText);
    }
    
  } catch (error) {
    console.error("❌ Network Error:", error);
  }
}

testAPI();