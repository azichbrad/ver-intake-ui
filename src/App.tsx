import { useState } from 'react'

function App() {
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // resultData holds the raw AI output, formData holds the user's editable version
  const [resultData, setResultData] = useState<any>(null)
  const [formData, setFormData] = useState<any>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResultData(null) 
      setFormData(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Dynamically update the specific field the user is typing in
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  }

  const handleSyncToPMS = async () => {
    setIsSyncing(true);
    try {
      // 👇 Paste your Webhook.site URL here!
      const pmsWebhookUrl = 'https://webhook.site/YOUR-UNIQUE-ID'; 
      
      const response = await fetch(pmsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'Vet Intake Scanner UI (Human Approved)',
          timestamp: new Date().toISOString(),
          patientData: formData // Sending the EDITED data, not the raw AI data
        })
      });

      if (response.ok) {
        alert("✅ Success! Human-verified data synced to PMS.");
      } else {
        alert("⚠️ Failed to sync to PMS.");
      }
    } catch (error) {
      console.error("Sync error:", error);
      alert("Error communicating with PMS.");
    } finally {
      setIsSyncing(false);
    }
  }

  const handleProcessForm = async () => {
    if (!image) return;
    setIsProcessing(true);
    
    const uploadData = new FormData();
    uploadData.append('image', image);

    try {
      // 👇 Make sure this is still your actual Render API URL!
      const response = await fetch('https://YOUR-RENDER-URL.onrender.com/api/intake/parse', {
        method: 'POST',
        body: uploadData,
      });

      if (!response.ok) throw new Error(`Server responded with ${response.status}`);

      const data = await response.json();
      setResultData(data);
      
      // Map the AI's nested JSON into a flat, easy-to-edit state object
      if (data?.data) {
        setFormData({
          petName: data.data.patient?.name || '',
          species: data.data.patient?.species || '',
          breed: data.data.patient?.breed || '',
          age: data.data.patient?.age || '',
          ownerFirstName: data.data.owner?.firstName || '',
          ownerLastName: data.data.owner?.lastName || '',
          phone: data.data.owner?.phone || '',
          reasonForVisit: data.data.visitDetails?.reasonForVisit || ''
        });
      }
      
    } catch (error) {
      console.error("Error processing:", error);
      alert("Failed to connect to the API.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Intake Scanner</h1>
        
        {/* Upload Box */}
        <div className="flex flex-col items-center justify-center w-full mb-6">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-blue-400 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-12 h-12 mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <p className="mb-2 text-lg text-blue-600 font-semibold">Tap to Open Camera</p>
            </div>
            <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleImageChange} />
          </label>
        </div>

        {/* Preview & Extract Button */}
        {previewUrl && !formData && (
          <div className="mt-6 animate-fade-in">
            <img src={previewUrl} alt="Preview" className="w-full h-auto rounded-lg border border-gray-200 shadow-sm mb-4" />
            <button 
              onClick={handleProcessForm}
              disabled={isProcessing}
              className={`w-full font-bold py-3 px-4 rounded-lg transition shadow-md ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {isProcessing ? 'AI is analyzing...' : 'Extract Data'}
            </button>
          </div>
        )}

        {/* Editable QA Form */}
        {formData && (
          <div className="mt-6 bg-white rounded-xl shadow border border-gray-200 overflow-hidden animate-fade-in text-left w-full">
            <div className="bg-yellow-500 px-4 py-3 flex items-center justify-between">
              <h2 className="text-md font-bold text-white">Review & Approve</h2>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Pet Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Pet Name</label>
                  <input type="text" name="petName" value={formData.petName} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Species</label>
                  <input type="text" name="species" value={formData.species} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded bg-gray-50 focus:bg-white outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Breed</label>
                  <input type="text" name="breed" value={formData.breed} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded bg-gray-50 focus:bg-white outline-none" />
                </div>
              </div>

              {/* Owner Info Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Owner First</label>
                  <input type="text" name="ownerFirstName" value={formData.ownerFirstName} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded bg-gray-50 focus:bg-white outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Owner Last</label>
                  <input type="text" name="ownerLastName" value={formData.ownerLastName} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded bg-gray-50 focus:bg-white outline-none" />
                </div>
              </div>

              {/* Final Sync Button */}
              <button 
                onClick={handleSyncToPMS}
                disabled={isSyncing}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition shadow-md"
              >
                {isSyncing ? 'Syncing...' : 'Approve & Sync to PMS'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default App