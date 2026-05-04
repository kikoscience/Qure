
async function testPatch() {
  try {
    const res = await fetch('http://localhost:3000/api/records', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: 106, 
        recordStatus: 'Printed',
        recordRetrievedBy: 'TEST_USER'
      }),
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
testPatch();
