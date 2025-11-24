export default function PaystackTest() {
  const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  
  console.log("🧪 PaystackTest Page Loaded!");
  console.log("🔑 Key from import.meta.env:", key);
  console.log("📦 Full import.meta.env:", import.meta.env);
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Paystack Key Test</h1>
      <div className="bg-gray-100 p-4 rounded-lg space-y-2">
        <p><strong>Key Value:</strong> {key || "NOT FOUND"}</p>
        <p><strong>Key Type:</strong> {typeof key}</p>
        <p><strong>Is Undefined:</strong> {key === undefined ? "YES" : "NO"}</p>
        <p><strong>Is Empty:</strong> {!key || key === "" ? "YES" : "NO"}</p>
        <p><strong>Key Length:</strong> {key ? key.length : 0}</p>
        <p><strong>Starts with pk_test:</strong> {key?.startsWith("pk_test_") ? "YES" : "NO"}</p>
        <p><strong>Starts with pk_live:</strong> {key?.startsWith("pk_live_") ? "YES" : "NO"}</p>
      </div>
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="font-semibold">Check Browser Console (F12) for more details!</p>
      </div>
    </div>
  );
}

