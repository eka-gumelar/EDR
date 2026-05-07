        const HARDCODED_USERS = [];
        const MASTER = { assy: typeof DATA_ASSY !== 'undefined' ? DATA_ASSY : [], users: [] };

        let user = null, records = [], manualMultiplier = 1, isTraining = false, editingId = null;
        let isIntentionalExit = false, isSpectator = false;
        let consecutiveSaves = 0; 
        let lastSavedAssy = ""; 
        let idleScrollTimer; 
        
        let currentAppMode = 'MARKER'; // Default saat buka aplikasi

        // Variabel Paginasi Data Report
        let arcFilteredData = []; 
        let arcCurrentPage = 1; 
        const ARC_PER_PAGE = 10;

                // --- LOGIKA ROTASI GAMBAR (FADING NG) ---
        setInterval(() => {
            // Animasi Fading NG Container 1 (Tipe 1 & 2)
            const ng1 = document.getElementById('ng-img-1');
            const ng2 = document.getElementById('ng-img-2');
            if(ng1 && ng2) {
                if(ng1.classList.contains('active')) { ng1.classList.remove('active'); ng2.classList.add('active'); }
                else { ng2.classList.remove('active'); ng1.classList.add('active'); }
            }
            
            // Animasi Fading NG Container 2 (Tipe 3 & 4)
            const ng3 = document.getElementById('ng-img-3');
            const ng4 = document.getElementById('ng-img-4');
            if(ng3 && ng4) {
                if(ng3.classList.contains('active')) { ng3.classList.remove('active'); ng4.classList.add('active'); }
                else { ng4.classList.remove('active'); ng3.classList.add('active'); }
            }
        }, 10000); 


        // --- SISTEM TOAST ---
        function showToast(message, type = 'success') { 
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            
            let iconSvg = '';
            let title = '';
            if (type === 'success') {
                iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                title = 'BERHASIL';
            } else if (type === 'error') {
                iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                title = 'PERINGATAN';
            } else {
                iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
                title = 'INFORMASI';
            }

            toast.innerHTML = `<div class="toast-icon">${iconSvg}</div><div class="toast-content"><span class="toast-title">${title}</span><span class="toast-message">${message}</span></div>`;
            container.prepend(toast);
            
            void toast.offsetWidth;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
                toast.style.transform = 'translateX(50px)';
                toast.style.opacity = '0';
                setTimeout(() => { if(container.contains(toast)) toast.remove(); }, 400);
            }, 3000); 
        }

        // --- SISTEM MODE SWITCHER (DI HALAMAN LOGIN) ---
        function setLoginMode(mode) {
            currentAppMode = mode;
            const btnMarker = document.getElementById('btn-mode-marker');
            const btnHeatgun = document.getElementById('btn-mode-heatgun');
            const iconBox = document.getElementById('login-icon-box');
            const loginSubmit = document.getElementById('btn-login-submit');

            if (mode === 'MARKER') {
                btnMarker.className = 'mode-select-btn active-marker';
                btnHeatgun.className = 'mode-select-btn inactive';
                iconBox.style.background = 'var(--primary-marker)';
                loginSubmit.style.background = 'var(--primary-marker)';
            } else {
                btnHeatgun.className = 'mode-select-btn active-heatgun';
                btnMarker.className = 'mode-select-btn inactive';
                iconBox.style.background = 'var(--primary-heatgun)';
                loginSubmit.style.background = 'var(--primary-heatgun)';
            }
        }

        function openModal(id) { 
            const el = document.getElementById(id);
            if(el) el.style.display = 'flex'; 
        }
        function closeModal(id) { 
            const el = document.getElementById(id);
            if(el) el.style.display = 'none'; 
        }
        function openZoomModal(src) { 
            const zoomImg = document.getElementById('zoom-img');
            if(zoomImg && src) { zoomImg.src = src; openModal('modal-zoom'); }
        }


        // --- SISTEM MODE SWITCHER (DI DALAM APP) ---
        function toggleAppMode() {
            if (isSpectator) return;
            currentAppMode = currentAppMode === 'MARKER' ? 'HEATGUN' : 'MARKER';
            applyAppModeUI();
            refreshUI();
            showToast(`Mode diubah ke ${currentAppMode}`, 'info');
        }

        function applyAppModeUI() {
            const navTitle = document.getElementById('nav-title-mode');
            const tableLabel = document.getElementById('table-mode-label');
            const visualMainLabel = document.getElementById('visual-main-label');
            const switcher = document.getElementById('btn-mode-switch');
            
            if (currentAppMode === 'HEATGUN') {
                document.documentElement.style.setProperty('--primary', 'var(--primary-heatgun)');
                navTitle.innerText = 'HEATGUN';
                tableLabel.innerText = 'HEATGUN';
                visualMainLabel.innerText = 'VISUAL SOP HEATGUN';
                if(switcher) switcher.title = 'Beralih ke Marker';
                
                document.getElementById('marker-input-group').classList.add('hidden');
                document.getElementById('cct-input-group').classList.remove('hidden'); 
                document.getElementById('visual-marker-group').classList.add('hidden');
                document.getElementById('visual-heatgun-group').classList.remove('hidden');
            } else {
                document.documentElement.style.setProperty('--primary', 'var(--primary-marker)');
                navTitle.innerText = 'MARKER';
                tableLabel.innerText = 'MARKER';
                visualMainLabel.innerText = 'SAMPLE MARKER';
                if(switcher) switcher.title = 'Beralih ke Heatgun';
                
                document.getElementById('marker-input-group').classList.remove('hidden');
                document.getElementById('cct-input-group').classList.add('hidden'); 
                document.getElementById('visual-marker-group').classList.remove('hidden');
                document.getElementById('visual-heatgun-group').classList.add('hidden');
            }
            
            // Filter dropdown pros
            const prosSelect = document.getElementById('ui-proses');
            if(prosSelect) {
                let options = Array.from(prosSelect.options);
                let firstMatchingMode = options.find(o => o.value.includes(currentAppMode) && o.value !== "SIMULASI");
                
                // Hide options that don't match the current mode (except SIMULASI)
                options.forEach(o => {
                    if(!o.value.includes(currentAppMode) && o.value !== "SIMULASI") {
                        o.style.display = 'none';
                    } else {
                        o.style.display = 'block';
                    }
                });

                if(firstMatchingMode && !isTraining) {
                    prosSelect.value = firstMatchingMode.value;
                    if(user) user.pros = firstMatchingMode.value;
                }
            }

            clearInputs();
        }

        // --- SISTEM MARKER & KALKULASI ---
        function updateVisualMarker() {
            if (currentAppMode !== 'MARKER') return;

            const m1 = document.getElementById('in-marker1');
            const m2 = document.getElementById('in-marker2');
            
            m1.value = m1.value.toUpperCase();
            m2.value = m2.value.toUpperCase();
            
            const v1 = document.getElementById('view-marker1-text');
            const v2 = document.getElementById('view-marker2-text');
            const box1 = document.getElementById('view-marker1-container');
            const box2 = document.getElementById('view-marker2-container');
            const warningBox = document.getElementById('ui-warning');
            
            let filledCount = 0;

            if(m1.value.trim() !== "") {
                v1.innerText = m1.value;
                v1.className = 'marker-display-text';
                box1.classList.add('active');
                filledCount++;
            } else {
                v1.innerText = "KIRI";
                v1.className = 'marker-placeholder';
                box1.classList.remove('active');
            }

            if(m2.value.trim() !== "") {
                v2.innerText = m2.value;
                v2.className = 'marker-display-text';
                box2.classList.add('active');
                filledCount++;
            } else {
                v2.innerText = "KANAN";
                v2.className = 'marker-placeholder';
                box2.classList.remove('active');
            }

            if(filledCount > 0) {
                warningBox.className = 'warning-flashing';
                warningBox.innerHTML = `⚠ HATI-HATI JANGAN SALAH HURUF & ARAH TERBALIK!`;
                document.getElementById('dir-container').classList.remove('hidden');
            } else {
                warningBox.className = 'warning-standby';
                warningBox.innerHTML = 'STANDBY - KETIK MARKER PADA FORM';
                document.getElementById('dir-container').classList.add('hidden');
            }

            checkFormCompleteness();
        }

        function duplicateMarker() {
            const m1 = document.getElementById('in-marker1');
            const m2 = document.getElementById('in-marker2');
            if(m1.value.trim() !== "") {
                m2.value = m1.value;
                updateVisualMarker();
                showToast("Marker Kiri berhasil diduplikat ke Kanan", "info");
            }
        }

        function getMarkerMultiplier() {
            if (currentAppMode === 'HEATGUN') return 1; // Heatgun tidak pakai marker multiplier
            const m1 = document.getElementById('in-marker1').value.trim();
            const m2 = document.getElementById('in-marker2').value.trim();
            let markerCount = (m1 !== "" ? 1 : 0) + (m2 !== "" ? 1 : 0);
            return markerCount === 0 ? 1 : markerCount; // Fallback ke 1 jika kosong
        }

        // --- SISTEM VALIDASI FORM ---
        function checkFormCompleteness() {
            if (isSpectator) return;
            const assy = document.getElementById('in-assy').value.trim();
            const cct = document.getElementById('in-cct').value.trim();
            const m1 = document.getElementById('in-marker1').value.trim();
            const m2 = document.getElementById('in-marker2').value.trim();
            const wp = document.getElementById('in-wp').value.trim();
            const qtyStr = document.getElementById('in-qty').value;
            const qty = parseInt(qtyStr);
            const btnSubmit = document.getElementById('btn-submit');
            const qtyEl = document.getElementById('in-qty');
            const hintEl = document.getElementById('calc-hint');

            let isModeDataValid = false;
            
            // Logika Validasi yang Berubah Berdasarkan Mode Aktif
            if (currentAppMode === 'HEATGUN') {
                isModeDataValid = (cct !== ""); // CCT harus diisi di Heatgun
            } else {
                isModeDataValid = (m1 !== "" || m2 !== ""); // Minimal salah satu marker terisi di Marker Mode
            }

            const currentMarkerMul = getMarkerMultiplier();
            let isQtyValid = false;
            hintEl.innerText = "";

            if (qtyStr !== "") {
                if (qty > 100) {
                    qtyEl.style.color = 'var(--danger)';
                    qtyEl.style.borderColor = 'var(--danger)';
                    qtyEl.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)';
                    hintEl.innerText = "QTY TERLALU BESAR";
                    hintEl.style.color = "var(--danger)";
                } else if (qty > 0) {
                    qtyEl.style.color = 'var(--text-main)';
                    qtyEl.style.borderColor = 'var(--primary)';
                    qtyEl.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.05)';
                    isQtyValid = true;
                    
                    if (currentMarkerMul > 1 && currentAppMode === 'MARKER') {
                        hintEl.innerText = `Log Aktif: ${qty} x ${currentMarkerMul} = ${qty * currentMarkerMul}`;
                    }
                }
            } else {
                qtyEl.style.color = 'var(--text-main)';
                qtyEl.style.borderColor = 'var(--border)';
                qtyEl.style.boxShadow = 'none';
            }

            if (assy && wp && isQtyValid && isModeDataValid) {
                btnSubmit.disabled = false;
            } else {
                btnSubmit.disabled = true;
            }
        }

        function lockForm() {
            const overlay = document.getElementById('form-overlay');
            if (overlay) overlay.classList.remove('hidden');
            ['in-assy', 'in-cct', 'in-marker1', 'in-marker2', 'in-wp', 'in-qty'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.disabled = true;
            });
            const btnSubmit = document.getElementById('btn-submit');
            if(btnSubmit) btnSubmit.disabled = true;
        }

        function unlockForm() {
            if(isSpectator) return;
            const overlay = document.getElementById('form-overlay');
            if (overlay) overlay.classList.add('hidden');
            ['in-assy', 'in-cct', 'in-marker1', 'in-marker2', 'in-wp', 'in-qty'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.disabled = false;
            });
            checkFormCompleteness(); 
        }

        function openModal(id) { document.getElementById(id).style.display = 'flex'; }
        function closeModal(id) { document.getElementById(id).style.display = 'none'; }
        function showLoader() { document.getElementById('global-loader').classList.remove('hidden'); }
        function hideLoader() { document.getElementById('global-loader').classList.add('hidden'); }
        function executeWithLoader(taskFn) { showLoader(); setTimeout(() => { try { taskFn(); } catch (e) { console.error(e); } hideLoader(); }, 50); }

        window.addEventListener('beforeunload', function (e) { if (user && user.id !== "111" && !isIntentionalExit && !isSpectator) { e.preventDefault(); e.returnValue = ''; } });

        /* --- LOGIKA WAKTU & TARGET --- */
        function getLogicalDate(timestamp) {
            const date = new Date(timestamp), jam = date.getHours(), menit = date.getMinutes();
            if (jam < 7 || (jam === 7 && menit < 30)) { date.setDate(date.getDate() - 1); }
            return date;
        }

        function getShiftDateISO(timestamp) {
            const date = getLogicalDate(timestamp), y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0'), d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }

        function getSessionIdentifier(timestamp) {
            const logicalDate = getLogicalDate(timestamp), y = logicalDate.getFullYear(), m = String(logicalDate.getMonth() + 1).padStart(2, '0'), d = String(logicalDate.getDate()).padStart(2, '0');
            const actualDate = new Date(timestamp), jam = actualDate.getHours(), menit = actualDate.getMinutes();
            let session = "PAGI"; if (jam >= 21 || jam < 7 || (jam === 7 && menit < 30)) session = "MALAM";
            return `${y}-${m}-${d}_${session}`;
        }

        function getTargetByProcess(prosRaw) {
            let p = String(prosRaw).toUpperCase();
            if (p.includes('SMV')) return 850;
            if (p.includes('PROJECT') || p.includes('WC')) return 2000;
            return 4000; 
        }

        /* --- INISIALISASI --- */
        window.onload = () => {
            let dynamicUsers = []; try { dynamicUsers = JSON.parse(localStorage.getItem('dynamicUsers') || '[]'); } catch (e) {}
            MASTER.users = [...HARDCODED_USERS, ...dynamicUsers];

            const lAssy = document.getElementById('list-assy');
            if (lAssy) { let h = ""; MASTER.assy.forEach(v => h += `<option value="${v}">`); lAssy.innerHTML = h; }
            
            document.getElementById('login-form').onsubmit = (e) => {
                e.preventDefault();
                const u = document.getElementById('login-username').value, p = document.getElementById('login-password').value;
                const match = MASTER.users.find(x => x.id === u && x.pass === p);
                if(match) { isTraining = false; executeWithLoader(() => login(match)); }
                else showToast("Lisensi ID atau Password Salah.", "error");
            };

            // Keyboard Events Logic - Dynamic Navigation based on Mode
            const inputs = ['in-assy', 'in-cct', 'in-marker1', 'in-marker2', 'in-wp', 'in-qty'];
            inputs.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.onkeydown = (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (id === 'in-qty') {
                                const btnSubmit = document.getElementById('btn-submit');
                                if (!btnSubmit.disabled) { handleSave(); } 
                                else { showToast('Lengkapi form terlebih dahulu!', 'error'); }
                            } else if (id === 'in-assy') {
                                let val = el.value.trim().toUpperCase();
                                if (val) {
                                    const match = MASTER.assy.find(a => a.toUpperCase().startsWith(val) || a.toUpperCase().includes(val));
                                    if (match) el.value = match;
                                }
                                if (currentAppMode === 'HEATGUN') {
                                    document.getElementById('in-cct').focus();
                                } else {
                                    document.getElementById('in-marker1').focus();
                                }
                            } else if (id === 'in-cct') {
                                document.getElementById('in-wp').focus();
                            } else if (id === 'in-marker1') {
                                document.getElementById('in-marker2').focus();
                            } else if (id === 'in-marker2') {
                                document.getElementById('in-wp').focus();
                            } else if (id === 'in-wp') {
                                document.getElementById('in-qty').focus();
                            }
                        }
                    };
                }
            });

            setInterval(() => {
                const now = new Date(), day = String(now.getDate()).padStart(2, '0'), monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                const clockStr = `${day} ${monthNames[now.getMonth()]} ${now.getFullYear()} - ${now.toLocaleTimeString('id-ID', { hour12: false })}`;
                const clockEl = document.getElementById('ui-clock'); if (clockEl) clockEl.innerText = clockStr;
            }, 1000);

            let idleEventThrottle;
            function handleIdleEvent() {
                if (idleEventThrottle) return;
                idleEventThrottle = setTimeout(() => { resetIdleScrollTimer(); idleEventThrottle = null; }, 500); 
            }
            ['scroll', 'mousemove', 'keydown', 'touchstart'].forEach(evt => window.addEventListener(evt, handleIdleEvent, { passive: true }));
            resetIdleScrollTimer();
        };

        /* --- ASYNC DRAG & DROP --- */
        async function getFilesFromDataTransfer(items) {
            let files = []; let promises = [];
            for (let i = 0; i < items.length; i++) { let item = items[i].webkitGetAsEntry(); if (item) promises.push(traverseFileTree(item, files)); }
            await Promise.all(promises); return files;
        }

        function traverseFileTree(item, files) {
            return new Promise((resolve) => {
                if (item.isFile) { item.file(file => { files.push(file); resolve(); });
                } else if (item.isDirectory) {
                    let dirReader = item.createReader();
                    dirReader.readEntries(async entries => { let promises = []; for (let i = 0; i < entries.length; i++) { promises.push(traverseFileTree(entries[i], files)); } await Promise.all(promises); resolve(); });
                } else { resolve(); }
            });
        }

        async function handleCustomDrop(event, mode) {
            showLoader();
            setTimeout(async () => {
                try { const items = event.dataTransfer.items; if (!items) { hideLoader(); return; } const files = await getFilesFromDataTransfer(items); processFiles(files, mode); } catch(e) { hideLoader(); }
            }, 50);
        }

        function handleFileInput(event, mode) {
            showLoader();
            setTimeout(() => { const files = Array.from(event.target.files); if (!files.length) { hideLoader(); return; } processFiles(files, mode); event.target.value = ''; }, 50);
        }

        function processFiles(files, mode) {
            let jsonFiles = files.filter(f => f.name.endsWith('.json'));
            if (jsonFiles.length === 0) { hideLoader(); showToast("Peringatan: Tidak ada file JSON.", "error"); return; }
            let filesRead = 0;
            if (mode === 'sync') {
                let loadedUsers = [];
                jsonFiles.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try { const json = JSON.parse(e.target.result); if (json.id && json.name && json.pass && !Array.isArray(json)) loadedUsers.push(json); } catch(err) {}
                        filesRead++;
                        if (filesRead === jsonFiles.length) {
                            try { localStorage.setItem('dynamicUsers', JSON.stringify(loadedUsers)); MASTER.users = [...HARDCODED_USERS, ...loadedUsers]; closeModal('modal-import-license'); showToast(`Mensinkronisasi ${loadedUsers.length} Lisensi MP.`, 'success');
                            } catch(err) { MASTER.users = [...HARDCODED_USERS, ...loadedUsers]; closeModal('modal-import-license'); }
                            hideLoader();
                        }
                    }; reader.readAsText(file);
                });
            }
        }

        /* --- LOGIKA OPERATOR --- */
        function login(data) {
            user = { ...data }; isSpectator = false; 
            
            document.getElementById('login-page').classList.add('hidden'); 
            
            // Tampilkan Modal Pemilihan Mode
            openModal('modal-mode-selection');
        }

        function selectModeAndStart(mode) {
            closeModal('modal-mode-selection');
            currentAppMode = mode;

            document.getElementById('app-page').classList.remove('hidden');
            document.getElementById('floating-monitor').classList.remove('hidden'); 
            document.getElementById('ui-user').innerText = user.name.toUpperCase(); 
            document.getElementById('ui-shift').innerText = user.shift; 
            
            applyAppModeUI(); // Terapkan UI berdasarkan mode yang dipilih

            if(isTraining && !user.pros) user.pros = "SIMULASI";
            
            const storageKey = `mp_records_cache_${user.id}`;
            if (!isTraining) { 
                try { 
                    let cachedRecords = JSON.parse(localStorage.getItem(storageKey)) || []; 
                    const now = Date.now(); 
                    records = cachedRecords.filter(r => (now - new Date(r.time).getTime()) < 172800000); 
                    records.forEach(r => r.appMode = r.appMode || 'MARKER');
                } catch (e) { records = []; } 
            } else { records = []; } 
            
            reactivateInputs(); refreshUI(); 
            
            if (currentAppMode === 'MARKER') {
                document.getElementById('in-assy').focus(); 
            } else {
                document.getElementById('in-assy').focus();
            }
            
            showToast(`Selamat datang, ${user.name.toUpperCase()}! Anda berada di Proses ${currentAppMode}.`, 'info');
        }

        function reactivateInputs() {
            unlockForm();
            document.getElementById('btn-submit').innerText = "ENTER"; 
            document.getElementById('btn-submit').className = "btn btn-primary"; 
            document.getElementById('btn-end-shift').classList.remove('hidden'); 
            document.getElementById('spectator-warning').classList.add('hidden');
        }

        function activateSpectatorMode() {
            isSpectator = true;
            lockForm();
            const btnSubmit = document.getElementById('btn-submit');
            btnSubmit.innerText = "SHIFT BERAKHIR (TERKUNCI)"; 
            btnSubmit.className = "btn"; 
            btnSubmit.style.background = 'var(--border)'; 
            btnSubmit.style.color = 'var(--text-muted)';
            
            document.getElementById('btn-end-shift').classList.add('hidden'); 
            document.getElementById('spectator-warning').classList.remove('hidden');
            document.querySelectorAll('.btn-edit, .btn-delete-row').forEach(btn => btn.classList.add('hidden'));
        }

        function processEndShift(shiftRecords, currentSession) {
            showLoader();
            setTimeout(() => {
                const dataStr = JSON.stringify(shiftRecords, null, 2); const blob = new Blob([dataStr], { type: "application/json" }); const url = URL.createObjectURL(blob);
                const dateOnly = currentSession.split('_')[0]; const fileName = `REPORT_${user.name.replace(/\s+/g, '_')}_${dateOnly}.json`;
                const a = document.createElement("a"); a.href = url; a.download = fileName; a.click(); URL.revokeObjectURL(url);
                setTimeout(() => { activateSpectatorMode(); hideLoader(); showToast('Shift diakhiri. Data diamankan.', 'success'); }, 2000);
            }, 50);
        }

        function endShift() {
            const currentSession = getSessionIdentifier(new Date()); 
            const shiftRecords = records.filter(r => getSessionIdentifier(r.time) === currentSession); // Unduh semua data terlepas dari Mode
            if(shiftRecords.length === 0) { showToast("Belum ada data produksi.", "error"); return; }
            document.getElementById('confirm-msg').innerText = "Akhiri shift dan unduh seluruh laporan?";
            document.getElementById('btn-confirm-ok').onclick = () => { closeModal('modal-confirm'); processEndShift(shiftRecords, currentSession); };
            openModal('modal-confirm');
        }

        function logout() { isIntentionalExit = true; location.reload(); }
        function changeProcess(newPros) { user.pros = newPros; refreshUI(); }
        function startTraining() { openModal('modal-training'); document.getElementById('in-training-name').focus(); }
        function submitTrainingName() { let tName = document.getElementById('in-training-name').value.trim(); if (!tName) tName = "PESERTA TRAINING"; isTraining = true; closeModal('modal-training'); executeWithLoader(() => login({ id: "TRAINING", name: tName + " (TRN)", shift: "T", kat: "EDU", pros: "SIMULASI" })); }
        
        function clearInputs() { 
            ['in-assy', 'in-cct', 'in-marker1', 'in-marker2', 'in-wp', 'in-qty'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; }); 
            consecutiveSaves = 0; lastSavedAssy = "";
            if (currentAppMode === 'MARKER') updateVisualMarker(); 
            const assyInput = document.getElementById('in-assy');
            if (assyInput && !assyInput.disabled) assyInput.focus();
        }

        function handleSave() {
            if (isSpectator) return; 
            
            const baseQty = parseInt(document.getElementById('in-qty').value);
            const markerMul = getMarkerMultiplier();
            const finalQty = baseQty * markerMul; 

            const data = { 
                assy: document.getElementById('in-assy').value, 
                cct: currentAppMode === 'HEATGUN' ? document.getElementById('in-cct').value.toUpperCase() : null,
                marker1: currentAppMode === 'MARKER' ? document.getElementById('in-marker1').value.toUpperCase() : null,
                marker2: currentAppMode === 'MARKER' ? document.getElementById('in-marker2').value.toUpperCase() : null,
                wp: document.getElementById('in-wp').value, 
                qty: finalQty, 
                baseQty: baseQty, 
                appMode: currentAppMode, 
                time: new Date().toISOString(), 
                userId: user.id, userName: user.name, userShift: user.shift, userPros: user.pros 
            };
            
            if (!data.assy || !data.qty) return;

            if (data.assy === lastSavedAssy && !editingId) { consecutiveSaves += manualMultiplier; } 
            else { consecutiveSaves = manualMultiplier; lastSavedAssy = data.assy; }

            if (editingId) { 
                const index = records.findIndex(r => r.id === editingId); 
                if (index !== -1) { data.id = editingId; data.time = records[index].time; records[index] = data; } 
                editingId = null; 
            } else { 
                for (let i = 0; i < manualMultiplier; i++) records.unshift({ ...data, id: Date.now() + i }); 
            }
            
            manualMultiplier = 1; document.getElementById('ui-multiplier').innerText = ''; 
            document.getElementById('btn-submit').innerText = "ENTER"; document.getElementById('btn-submit').className = "btn btn-primary"; 
            document.getElementById('ui-form-title').innerText = "INPUT DATA PRODUKSI"; document.getElementById('ui-form-title').style.color = "var(--text-main)"; 
            document.getElementById('btn-cancel-edit').classList.add('hidden'); 
            
            if (!isTraining) localStorage.setItem(`mp_records_cache_${user.id}`, JSON.stringify(records));
            refreshUI();

            if (consecutiveSaves >= 50) {
                clearInputs();
                showToast('Circuit Breaker (50x): Form di-reset untuk MENCEGAH KELELAHAN.', 'info');
            } else {
                document.getElementById('in-qty').value = ''; 
                document.getElementById('in-cct').value = ''; 
                document.getElementById('in-marker1').value = ''; 
                document.getElementById('in-marker2').value = ''; 
                document.getElementById('calc-hint').innerText = ''; 
                
                if (currentAppMode === 'MARKER') {
                    updateVisualMarker(); 
                    document.getElementById('in-marker1').focus(); 
                } else {
                    document.getElementById('in-cct').focus(); // Kembali ke CCT khusus Heatgun
                }
                
                checkFormCompleteness(); 
                
                if(markerMul > 1 && currentAppMode === 'MARKER') {
                    showToast(`Data disimpan! Output log x${markerMul} otomatis dari Marker.`);
                } else {
                    showToast('Data berhasil disimpan!');
                }
            }
        }

        function startEdit(id) {
            if(isSpectator) return;
            const record = records.find(r => r.id === id); if (!record) return; editingId = id;
            
            // Validasi: Jika record berbeda mode dari UI saat ini, paksa switch UI
            if (record.appMode && record.appMode !== currentAppMode) {
                toggleAppMode();
            }

            document.getElementById('in-assy').value = record.assy; 
            if(currentAppMode === 'MARKER') {
                document.getElementById('in-marker1').value = record.marker1 || "";
                document.getElementById('in-marker2').value = record.marker2 || "";
                updateVisualMarker();
            } else {
                document.getElementById('in-cct').value = record.cct || "";
            }
            document.getElementById('in-wp').value = record.wp; 
            document.getElementById('in-qty').value = record.baseQty || record.qty; 
            
            document.getElementById('ui-form-title').innerText = "⚠ MODE EDIT DATA"; document.getElementById('ui-form-title').style.color = "var(--warning)"; 
            document.getElementById('btn-submit').innerText = "UPDATE DATA"; document.getElementById('btn-submit').className = "btn btn-update"; 
            document.getElementById('btn-cancel-edit').classList.remove('hidden');
            
            document.getElementById('in-qty').focus(); 
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        function cancelEdit() { 
            editingId = null; 
            document.getElementById('btn-submit').innerText = "ENTER"; document.getElementById('btn-submit').className = "btn btn-primary"; 
            document.getElementById('ui-form-title').innerText = "INPUT DATA PRODUKSI"; document.getElementById('ui-form-title').style.color = "var(--text-main)"; 
            document.getElementById('btn-cancel-edit').classList.add('hidden'); 
            clearInputs(); 
        }
        
        function deleteLog(id) { 
            if(isSpectator) return;
            executeWithLoader(() => { records = records.filter(r => r.id !== id); if (!isTraining) localStorage.setItem(`mp_records_cache_${user.id}`, JSON.stringify(records)); refreshUI(); });
        }

        function refreshUI() {
            const currentSession = getSessionIdentifier(new Date()); 
            
            // Dapatkan semua record sesi ini tanpa peduli modenya
            const allShiftRecords = records.filter(r => getSessionIdentifier(r.time) === currentSession);
            
            // Pisahkan berdasarkan mode
            const markerRecords = allShiftRecords.filter(r => (r.appMode || 'MARKER') === 'MARKER');
            const heatgunRecords = allShiftRecords.filter(r => r.appMode === 'HEATGUN');
            
            const totalMarker = markerRecords.reduce((s, r) => s + Number(r.qty), 0);
            const totalHeatgun = heatgunRecords.reduce((s, r) => s + Number(r.qty), 0);
            const totalCombined = totalMarker + totalHeatgun;

            // Target dihitung berdasarkan PROSES AKTIF agar relevan dengan tugas yang sedang dikerjakan saat ini
            const activeTotal = currentAppMode === 'MARKER' ? totalMarker : totalHeatgun;
            const target = getTargetByProcess(user.pros);
            const targetHourly = Math.round(target / 8);
            
            const percent = Math.round((activeTotal / target) * 100);
            
            // Update UI Monitor Melayang
            document.getElementById('ui-total-combined').innerText = totalCombined; 
            document.getElementById('ui-total-marker').innerText = totalMarker; 
            document.getElementById('ui-total-heatgun').innerText = totalHeatgun; 
            
            document.getElementById('ui-target').innerText = target;
            document.getElementById('ui-target-hourly').innerText = targetHourly;
            document.getElementById('ui-gap').innerText = activeTotal >= target ? "OK" : (activeTotal - target); 
            document.getElementById('ui-gap').style.color = activeTotal >= target ? 'var(--success)' : 'var(--danger)';
            document.getElementById('ui-percent').innerText = percent + '%'; 
            document.getElementById('ui-progress-bar').style.width = Math.min(100, percent) + '%'; 
            
            if(percent >= 100) { document.getElementById('ui-progress-bar').style.background = 'var(--success)'; document.getElementById('ui-percent').style.color = 'var(--success)'; }
            else { document.getElementById('ui-progress-bar').style.background = 'var(--primary)'; document.getElementById('ui-percent').style.color = 'var(--primary)'; }
            
            // Tabel spesifik hanya menampilkan record mode yang sedang aktif agar riwayat tidak berantakan
            const activeShiftRecords = currentAppMode === 'MARKER' ? markerRecords : heatgunRecords;
            document.getElementById('ui-count').innerText = activeShiftRecords.length + ' WOS';
            const body = document.getElementById('main-table-body'); 
            
            let htmlBatch = ''; const renderLimit = Math.min(activeShiftRecords.length, 30); 
            for (let i = 0; i < renderLimit; i++) {
                const r = activeShiftRecords[i];
                let dispData = '-';
                if(currentAppMode === 'MARKER') {
                    dispData = `[${r.marker1 || '-'}] [${r.marker2 || '-'}]`;
                } else {
                    dispData = `CCT: ${r.cct || '-'}`;
                }
                
                let actionBtns = `<button onclick="startEdit(${r.id})" class="btn btn-edit ${isSpectator ? 'hidden' : ''}">EDIT</button><button onclick="deleteLog(${r.id})" class="btn btn-delete-row ${isSpectator ? 'hidden' : ''}">HAPUS</button>`;
                htmlBatch += `<tr><td style="font-weight:600;">${r.assy}</td><td style="text-align:center; font-family:monospace; font-weight:800; font-size:12px;">${dispData}</td><td style="text-align:left; font-weight:600;">${r.wp}</td><td style="text-align:center; font-weight:900; color:var(--primary); font-size:14px;">${r.qty}</td><td style="font-size:11px; opacity:0.7;">${new Date(r.time).toLocaleTimeString()}</td><td style="text-align:right; white-space:nowrap;">${actionBtns}</td></tr>`; 
            }
            if (activeShiftRecords.length > 30) htmlBatch += `<tr><td colspan="6" style="text-align:center; font-size:10px; opacity:0.5; padding: 10px;">... ${activeShiftRecords.length - 30} data terdahulu disembunyikan ...</td></tr>`;
            body.innerHTML = htmlBatch; 
        }

        function openMultiplier(e) { if (e) e.preventDefault(); openModal('modal-mul'); document.getElementById('in-mul').focus(); }
        function applyMultiplier() { manualMultiplier = parseInt(document.getElementById('in-mul').value) || 1; document.getElementById('ui-multiplier').innerText = manualMultiplier > 1 ? `(+ x${manualMultiplier})` : ''; closeModal('modal-mul'); }
        
        function openArchive(show) { 
            if(show) { openModal('modal-arc'); document.getElementById('arc-date').value = getShiftDateISO(new Date()); executeWithLoader(renderArchiveTable); } 
            else { closeModal('modal-arc'); } 
        }

        function renderArchiveTable() { 
            const targetStr = document.getElementById('arc-date').value; if (!targetStr) return;
            const filtered = records.filter(r => { return getShiftDateISO(r.time) === targetStr && (r.appMode || 'MARKER') === currentAppMode; }); 
            filtered.sort((a, b) => new Date(b.time) - new Date(a.time));
            arcFilteredData = filtered; arcCurrentPage = 1;
            document.getElementById('arc-total').innerText = filtered.reduce((s, r) => s + Number(r.qty), 0); 
            document.getElementById('arc-wos-count').innerText = filtered.length + ' WOS';
            displayArcPage();
        }

        function displayArcPage() {
            const body = document.getElementById('archive-table-body'); const paginationUI = document.getElementById('arc-pagination');
            if (!body) return; body.innerHTML = ''; 
            
            if(arcFilteredData.length === 0) { body.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; opacity: 0.5;">Tidak ada riwayat pada tanggal ini.</td></tr>'; paginationUI.classList.add('hidden'); return; } 
            
            paginationUI.classList.remove('hidden');
            const startIndex = (arcCurrentPage - 1) * ARC_PER_PAGE; const endIndex = startIndex + ARC_PER_PAGE;
            const paginatedItems = arcFilteredData.slice(startIndex, endIndex);

            let arcHtmlBatch = ''; 
            paginatedItems.forEach(r => { 
                let dispData = currentAppMode === 'MARKER' ? `[${r.marker1 || '-'}] [${r.marker2 || '-'}]` : `CCT: ${r.cct || '-'}`;
                arcHtmlBatch += `<tr><td style="font-weight:600;">${r.assy}</td><td style="text-align:center; font-family:monospace; font-weight:800;">${dispData}</td><td style="text-align:left; font-weight:600;">${r.wp}</td><td style="text-align:center; font-weight:900; color:var(--primary); font-size:14px;">${r.qty}</td><td style="font-size:11px; opacity:0.7;">${new Date(r.time).toLocaleString('id-ID')}</td></tr>`; 
            });
            body.innerHTML = arcHtmlBatch;
            
            const totalPages = Math.ceil(arcFilteredData.length / ARC_PER_PAGE) || 1;
            document.getElementById('arc-page-info').innerText = `Halaman ${arcCurrentPage} dari ${totalPages}`;
            document.getElementById('btn-arc-prev').disabled = arcCurrentPage === 1; document.getElementById('btn-arc-next').disabled = arcCurrentPage === totalPages;
        }
        function changeArcPage(dir) { arcCurrentPage += dir; displayArcPage(); }
        function toggleMonitor() { const panel = document.getElementById('floating-monitor'); if (!panel) return; if (panel.classList.contains('open')) { panel.classList.remove('open'); } else { panel.classList.add('open'); } }

        function exportArchiveJSON() {
            const targetStr = document.getElementById('arc-date').value; if (!targetStr) { showToast("Pilih tanggal terlebih dahulu.", "error"); return; }
            const filtered = records.filter(r => getShiftDateISO(r.time) === targetStr); if(filtered.length === 0) { showToast("Tidak ada data.", "error"); return; }
            const dataStr = JSON.stringify(filtered, null, 2); const blob = new Blob([dataStr], { type: "application/json" }); const url = URL.createObjectURL(blob);
            const fileName = `REPORT_GABUNGAN_${user.name.replace(/\s+/g, '_')}_${targetStr}.json`; const a = document.createElement("a"); a.href = url; a.download = fileName; a.click(); URL.revokeObjectURL(url);
        }

        function resetIdleScrollTimer() {
            if (isSpectator) return; clearTimeout(idleScrollTimer);
            idleScrollTimer = setTimeout(() => { if (window.scrollY > 150) { smoothScrollToTop(1200); } }, 15000); 
        }

        function smoothScrollToTop(duration) {
            const startPosition = window.pageYOffset; const startTime = performance.now();
            function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
            function animation(currentTime) {
                const timeElapsed = currentTime - startTime; let progress = timeElapsed / duration; if (progress > 1) progress = 1;
                window.scrollTo(0, startPosition * (1 - easeInOutCubic(progress)));
                if (progress < 1) { requestAnimationFrame(animation); } 
                else { const assyInput = document.getElementById('in-assy'); if (assyInput && !assyInput.disabled) { assyInput.focus(); } }
            }
            requestAnimationFrame(animation);
        }