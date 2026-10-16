const fs = require('fs');

const path = 'c:/Users/Adnan/OneDrive/Documents/Zuhri/code/AmanKampus/app/report/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Imports
content = content.replace(
  'Eye,\n} from \'lucide-react\';',
  'Eye,\n  Camera,\n  Cpu,\n  FileSearch,\n  ShieldCheck\n} from \'lucide-react\';'
);

// 2. Types and States
content = content.replace(
  '// ─── Evidence state ──────────────────────────────────────────────────────\n  const [pendingFiles, setPendingFiles] = useState<File[]>([]);',
  `// ─── Forensic Types ──────────────────────────────────────────────────────
  type ForensicFile = {
    file: File;
    isLiveCapture: boolean;
    forensicStatus: 'Original' | 'Needs Review' | 'Manipulated';
    forensicDetails: string[];
  };

  // ─── Evidence state ──────────────────────────────────────────────────────
  const [pendingFiles, setPendingFiles] = useState<ForensicFile[]>([]);
  const [isScanning, setIsScanning] = useState(false);`
);

// 3. validateAndAddFiles
const oldValidate = `  const validateAndAddFiles = useCallback((newFiles: FileList | File[]) => {
    const errs: string[] = [];
    const valid: File[] = [];
    Array.from(newFiles).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errs.push(\`"\${file.name}" — tipe file tidak didukung.\`);
      } else if (file.size > MAX_FILE_SIZE_BYTES) {
        errs.push(\`"\${file.name}" — ukuran melebihi \${MAX_FILE_SIZE_MB}MB.\`);
      } else {
        valid.push(file);
      }
    });
    setPendingFiles((prev) => [...prev, ...valid]);
    setFileErrors(errs);
  }, []);`;

const newValidate = `  const validateAndAddFiles = useCallback((newFiles: FileList | File[], isLiveCapture: boolean = false) => {
    const errs: string[] = [];
    const valid: File[] = [];
    Array.from(newFiles).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errs.push(\`"\${file.name}" — tipe file tidak didukung.\`);
      } else if (file.size > MAX_FILE_SIZE_BYTES) {
        errs.push(\`"\${file.name}" — ukuran melebihi \${MAX_FILE_SIZE_MB}MB.\`);
      } else {
        valid.push(file);
      }
    });

    if (valid.length > 0) {
      setIsScanning(true);
      setFileErrors([]);
      
      // Simulasi Forensic Scan
      setTimeout(() => {
        const forensicResults: ForensicFile[] = valid.map(file => {
          const isManipulated = Math.random() > 0.85 && !isLiveCapture; // Simulasi 15% terindikasi
          const needsReview = Math.random() > 0.7 && !isManipulated;
          
          let status: 'Original' | 'Needs Review' | 'Manipulated' = 'Original';
          let details: string[] = [];
          
          if (isLiveCapture) {
            status = 'Original';
            details = [
              'Timestamp: Current (Live)',
              'Device: Kamera Internal Terverifikasi',
              'Geotagging: Sesuai Koordinat'
            ];
          } else if (isManipulated) {
            status = 'Manipulated';
            details = [
              'Peringatan: Pola piksel anomali terdeteksi',
              'Metadata EXIF: Hilang/Dihapus',
              'Indikasi editor: Adobe Photoshop / AI Tool'
            ];
          } else if (needsReview) {
            status = 'Needs Review';
            details = [
              'Timestamp EXIF tidak konsisten',
              'Perangkat tidak dikenali',
              'Kemungkinan hasil Screenshot'
            ];
          } else {
            status = 'Original';
            details = [
              'Timestamp EXIF: Tervalidasi',
              'Device: Mobile Android/iOS',
              'Resolusi: Proporsional'
            ];
          }
          
          return {
            file,
            isLiveCapture,
            forensicStatus: status,
            forensicDetails: details
          };
        });

        setIsScanning(false);
        setPendingFiles((prev) => [...prev, ...forensicResults]);
        setFileErrors(errs);
      }, 2500); // 2.5s scan animation
    } else {
      setFileErrors(errs);
    }
  }, []);`;
content = content.replace(oldValidate, newValidate);

// 4. Input Handlers
content = content.replace(
  `  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) validateAndAddFiles(e.target.files);
    e.target.value = '';
  };`,
  `  const fileCameraRef = useRef<HTMLInputElement>(null);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) validateAndAddFiles(e.target.files, false);
    e.target.value = '';
  };
  
  const handleCameraInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) validateAndAddFiles(e.target.files, true);
    e.target.value = '';
  };`
);

// 5. Submit Changes
const oldSubmitEvidences = `    const evidences: Evidence[] = [];
    for (const file of pendingFiles) {
      const buffer = await readFileAsBuffer(file);
      const hash = await sha256Hex(buffer);
      const dataUrl = await readFileAsDataUrl(file);
      evidences.push({
        evidenceId: \`EVD-\${Date.now()}-\${Math.random().toString(36).substring(2, 6).toUpperCase()}\`,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        sha256: hash,
        dataUrl,
      });
    }`;
const newSubmitEvidences = `    const evidences: Evidence[] = [];
    for (const pFile of pendingFiles) {
      const buffer = await readFileAsBuffer(pFile.file);
      const hash = await sha256Hex(buffer);
      const dataUrl = await readFileAsDataUrl(pFile.file);
      evidences.push({
        evidenceId: \`EVD-\${Date.now()}-\${Math.random().toString(36).substring(2, 6).toUpperCase()}\`,
        fileName: pFile.file.name,
        fileType: pFile.file.type,
        fileSize: pFile.file.size,
        sha256: hash,
        dataUrl,
        isLiveCapture: pFile.isLiveCapture,
        forensicStatus: pFile.forensicStatus,
        forensicDetails: pFile.forensicDetails
      });
    }`;
content = content.replace(oldSubmitEvidences, newSubmitEvidences);

// 6. UI Step 2 tweaks
const oldUIUpload = `                    {/* Drop zone */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={\`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all \${
                        isDragOver
                          ? 'border-indigo-400 bg-indigo-500/10'
                          : 'border-slate-700 hover:border-indigo-500/60 bg-slate-950 hover:bg-indigo-500/5'
                      }\`}
                    >
                      <div className={\`w-14 h-14 rounded-full flex items-center justify-center transition-colors \${isDragOver ? 'bg-indigo-500/20' : 'bg-slate-800'}\`}>
                        <Upload className={\`w-6 h-6 transition-colors \${isDragOver ? 'text-indigo-400' : 'text-slate-400'}\`} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-300 font-medium">
                          <span className="text-indigo-400 font-semibold">Klik untuk pilih file</span>{' '}
                          atau drag & drop
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Screenshot, PDF, Audio (MP3/WAV), atau Video (MP4) — Maks. \${MAX_FILE_SIZE_MB}MB per file
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={ALLOWED_TYPES.join(',')}
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </div>`;

const newUIUpload = `                    {/* Scanning Overlay */}
                    <AnimatePresence>
                      {isScanning && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-indigo-900/40 border border-indigo-500/50 rounded-2xl p-6 overflow-hidden relative"
                        >
                          <motion.div 
                            animate={{ left: ['-10%', '110%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent skew-x-12"
                          />
                          <div className="flex flex-col items-center justify-center gap-3 relative z-10">
                            <Cpu className="w-8 h-8 text-indigo-400 animate-pulse" />
                            <p className="text-sm font-bold text-indigo-200">AI Forensic Scan Berjalan...</p>
                            <p className="text-xs text-indigo-300/70 text-center max-w-sm">Mengekstraksi metadata EXIF, mendeteksi pola piksel, dan menjalankan validasi integritas terhadap file yang diunggah.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Upload Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Live Capture */}
                      <button
                        type="button"
                        onClick={() => fileCameraRef.current?.click()}
                        disabled={isScanning}
                        className="bg-teal-500/10 border-2 border-teal-500/30 hover:border-teal-500 hover:bg-teal-500/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all disabled:opacity-50"
                      >
                        <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                          <Camera className="w-6 h-6 text-teal-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-teal-300">Live Capture</p>
                          <p className="text-xs text-teal-400/70 mt-0.5">Ambil foto/video langsung (Lebih Terpercaya)</p>
                        </div>
                      </button>
                      <input
                        ref={fileCameraRef}
                        type="file"
                        accept="image/*,video/*"
                        capture="environment"
                        onChange={handleCameraInput}
                        className="hidden"
                      />

                      {/* Drop zone */}
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => !isScanning && fileInputRef.current?.click()}
                        className={\`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all \${
                          isScanning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        } \${
                          isDragOver
                            ? 'border-indigo-400 bg-indigo-500/10'
                            : 'border-slate-700 hover:border-indigo-500/60 bg-slate-950 hover:bg-indigo-500/5'
                        }\`}
                      >
                        <div className={\`w-12 h-12 rounded-full flex items-center justify-center transition-colors \${isDragOver ? 'bg-indigo-500/20' : 'bg-slate-800'}\`}>
                          <Upload className={\`w-5 h-5 transition-colors \${isDragOver ? 'text-indigo-400' : 'text-slate-400'}\`} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-indigo-300">Pilih Berkas</p>
                          <p className="text-xs text-slate-500 mt-0.5 whitespace-pre-wrap">PDF, Audio, Video, Image</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept={ALLOWED_TYPES.join(',')}
                          onChange={handleFileInput}
                          className="hidden"
                        />
                      </div>
                    </div>`;
content = content.replace(oldUIUpload, newUIUpload);

// 7. Update file rendering in step 2
const oldFileRender = `                    {/* File list */}
                    {pendingFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                          {pendingFiles.length} file dipilih
                        </p>
                        {pendingFiles.map((file, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                          >
                            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-200 font-medium truncate">{file.name}</p>
                              <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}`;

const newFileRender = `                    {/* File list */}
                    {pendingFiles.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-2">
                          <FileSearch className="w-4 h-4" /> {pendingFiles.length} file dianalisis
                        </p>
                        {pendingFiles.map((pFile, i) => (
                          <div
                            key={i}
                            className={\`border rounded-xl p-4 space-y-3 transition-colors \${
                               pFile.forensicStatus === 'Original' ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40' :
                               pFile.forensicStatus === 'Needs Review' ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40' :
                               'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
                            }\`}
                          >
                            <div className="flex items-center gap-3 relative">
                              <div className={\`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 \${
                                 pFile.forensicStatus === 'Original' ? 'bg-emerald-500/10 border-emerald-500/30' :
                                 pFile.forensicStatus === 'Needs Review' ? 'bg-amber-500/10 border-amber-500/30' :
                                 'bg-rose-500/10 border-rose-500/30'
                              }\`}>
                                {pFile.isLiveCapture ? <Camera className="w-4 h-4 text-teal-400" /> : <ShieldCheck className={\`w-4 h-4 \${
                                   pFile.forensicStatus === 'Original' ? 'text-emerald-400' :
                                   pFile.forensicStatus === 'Needs Review' ? 'text-amber-400' :
                                   'text-rose-400'
                                }\`} />}
                              </div>
                              <div className="flex-1 min-w-0 pr-6">
                                <p className="text-sm text-slate-200 font-medium truncate">{pFile.file.name}</p>
                                <p className="text-xs text-slate-500">{formatBytes(pFile.file.size)}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="absolute right-0 top-0 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {/* Forensic Badge & Details */}
                            <div className="pt-3 border-t border-white/5 space-y-2">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className={\`w-3.5 h-3.5 \${
                                  pFile.forensicStatus === 'Original' ? 'text-emerald-400' :
                                  pFile.forensicStatus === 'Needs Review' ? 'text-amber-400' :
                                  'text-rose-400'
                                }\`}/>
                                <span className={\`text-xs font-bold \${
                                  pFile.forensicStatus === 'Original' ? 'text-emerald-400' :
                                  pFile.forensicStatus === 'Needs Review' ? 'text-amber-400' :
                                  'text-rose-400'
                                }\`}>
                                  {pFile.forensicStatus === 'Original' && (pFile.isLiveCapture ? 'Live Capture (Tervalidasi)' : 'Metadata Terverifikasi (Asli)')}
                                  {pFile.forensicStatus === 'Needs Review' && 'Peringatan: Metadata tidak lengkap / Screenshot'}
                                  {pFile.forensicStatus === 'Manipulated' && 'Terindikasi: Suntingan / Manipulasi Digital'}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {pFile.forensicDetails.map((detail, idx) => (
                                  <span key={idx} className="text-[10px] text-slate-400 bg-black/20 border border-white/5 rounded px-2 py-1 truncate">
                                    • {detail}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}`;
content = content.replace(oldFileRender, newFileRender);

// 8. Update step 3
content = content.replace(
  `                          {pendingFiles.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                              <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="truncate">{f.name}</span>
                              <span className="text-slate-600 shrink-0">({formatBytes(f.size)})</span>
                            </div>
                          ))}`,
  `                          {pendingFiles.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                              <ShieldCheck className={\`w-3.5 h-3.5 shrink-0 \${
                                f.forensicStatus === 'Original' ? 'text-emerald-400' :
                                f.forensicStatus === 'Needs Review' ? 'text-amber-400' : 'text-rose-400'
                              }\`} />
                              <span className="truncate">{f.file.name}</span>
                              <span className="text-slate-600 shrink-0">({formatBytes(f.file.size)})</span>
                            </div>
                          ))}`
);

// Bugfix drop
content = content.replace(
  `    if (e.dataTransfer.files) validateAndAddFiles(e.dataTransfer.files);`,
  `    if (e.dataTransfer.files) validateAndAddFiles(e.dataTransfer.files, false);`
);

fs.writeFileSync(path, content);
