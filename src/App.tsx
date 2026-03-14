import { useState } from 'react'

function App() {
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultData, setResultData] = useState<any>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResultData(null) // Clear old results when a new image is picked
    }
  }

  const handleProcessForm = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    
    // 1. Pack the image into a FormData object
    const formData = new FormData();
    formData.append('image', image);

    try {
      // 2. Send it to your live API! 
      // 👇 👇 👇 REPLACE THIS URL WITH YOUR RENDER URL 👇 👇 👇
      const response = await fetch('https://vet-intake-api.onrender.com/api/intake/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      // 3. Get the JSON back and save it to state
      const data = await response.json();
      setResultData(data);
      
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Uh oh! Failed to connect to the API. Check the console.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Intake Scanner</h1>
        
        {/* The Camera / Upload Box */}
        <div className="flex flex-col items-center justify-center w-full mb-6">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-blue-400 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-12 h-12 mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <p className="mb-2 text-lg text-blue-600 font-semibold">Tap to Open Camera</p>
              <p className="text-sm text-blue-500">or select a document</p>
            </div>
            <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleImageChange} />
          </label>
        </div>

        {/* The Image Preview & Submit Button */}
        {previewUrl && (
          <div className="mt-6 animate-fade-in">
            <img src={previewUrl} alt="Preview" className="w-full h-auto rounded-lg border border-gray-200 shadow-sm mb-4" />
            <button 
              onClick={handleProcessForm}
              disabled={isProcessing}
              className={`w-full font-bold py-3 px-4 rounded-lg transition shadow-md ${
                isProcessing 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isProcessing ? 'AI is analyzing...' : 'Process Form Data'}
            </button>
          </div>
        )}

       {/* The AI Results Display */}
        {resultData && resultData.data && (
          <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden animate-fade-in">
            {/* Success Header */}
            <div className="bg-green-600 px-4 py-3 flex items-center">
              <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h2 className="text-md font-bold text-white">Extraction Successful</h2>
            </div>
            
            <div className="p-5 space-y-6">
              {/* Patient Info Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b pb-1">Patient Details</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-semibold text-gray-800">{resultData.data.patient?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Age</p>
                    <p className="font-semibold text-gray-800">{resultData.data.patient?.age_years ? `${resultData.data.patient.age_years} yrs` : 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Species / Breed</p>
                    <p className="font-semibold text-gray-800">{resultData.data.patient?.species || 'N/A'} - {resultData.data.patient?.breed || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Owner Info Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b pb-1">Owner Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-semibold text-gray-800">{resultData.data.owner?.firstName || ''} {resultData.data.owner?.lastName || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="font-semibold text-gray-800">{resultData.data.owner?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Review Warning if AI was unsure */}
              {resultData.meta?.flaggedForReview && (
                 <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                   <div className="flex">
                     <div className="ml-3">
                       <p className="text-sm text-yellow-700 font-medium">
                         Please double-check the values. The handwriting was difficult to read.
                       </p>
                     </div>
                   </div>
                 </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App