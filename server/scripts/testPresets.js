import fs from 'fs';

async function testUnsigned() {
  const filePath = 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\cat_houses_1791707315964.jpg';
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

  const presets = ['ml_default', 'yene_kiray', 'unsigned', 'preset1', 'default'];
  for (const preset of presets) {
    try {
      const form = new URLSearchParams();
      form.append('file', base64Data);
      form.append('upload_preset', preset);

      const res = await fetch('https://api.cloudinary.com/v1_1/udiar6as/image/upload', {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`PRESET ${preset} SUCCESS:`, data.secure_url);
        return;
      } else {
        console.log(`PRESET ${preset} FAILED:`, data.error?.message);
      }
    } catch (e) {
      console.log(`PRESET ${preset} ERR:`, e.message);
    }
  }
  process.exit(0);
}

testUnsigned();
