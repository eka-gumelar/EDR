        /* --- [09. DATABASE MASTER DENGAN SIMILARS ARRAY] --- */
        const HARDCODED_USERS = [];

        const MASTER = { assy: typeof DATA_ASSY !== 'undefined' ? DATA_ASSY : [], parts: typeof DATA_PARTS !== 'undefined' ? DATA_PARTS : [], users: [] };

        let user = null, records = [], multiplier = 1, isTraining = false, editingId = null;
        let isIntentionalExit = false, isSpectator = false;
        
        let lastValidPart = ""; 
        let consecutiveSaves = 0; 
        let lastSavedAssy = ""; 
        let idleScrollTimer; 
        let currentToastTimeout; 
        let carouselIntervalId = null; // Variabel Penahan Interval Rotasi Gambar
        let activeVkInput = null; // Menyimpan referensi input yang sedang difokuskan untuk VK

        // Variabel Paginasi Data Report Sesi Aktif
        let arcFilteredData = []; 
        let arcCurrentPage = 1; 
        const ARC_PER_PAGE = 10;

        // FUNGSI TOAST NOTIFICATION
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

            toast.innerHTML = `
                <div class="toast-icon">${iconSvg}</div>
                <div class="toast-content">
                    <span class="toast-title">${title}</span>
                    <span class="toast-message">${message}</span>
                </div>
            `;
            
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

        // --- SISTEM VIRTUAL KEYBOARD MELAYANG ---
        function openKeyboard(inputElement) {
            if (isSpectator) return; 
            activeVkInput = inputElement;
            const vk = document.getElementById('virtual-keyboard');
            
            // Mengambil posisi persis dari kolom yang diklik
            const rect = inputElement.getBoundingClientRect();
            
            // Posisikan tepat di bawah kolom (dengan sedikit margin 8px)
            vk.style.top = (rect.bottom + window.scrollY + 8) + 'px';
            
            // Mengatur posisi horizontal agar tidak keluar layar (off-screen)
            let leftPos = rect.left + window.scrollX;
            if (leftPos + 360 > window.innerWidth) { 
                leftPos = window.innerWidth - 380; 
            }
            vk.style.left = leftPos + 'px';
            
            vk.classList.add('vk-show');
        }
        
        function closeKeyboard() {
            const vk = document.getElementById('virtual-keyboard');
            if (vk) vk.classList.remove('vk-show');
            activeVkInput = null;
        }

        // Global listener untuk menutup keyboard saat area luar diklik (Solusi Anti-Bug)
        document.addEventListener('mousedown', function(e) {
            const vk = document.getElementById('virtual-keyboard');
            if (activeVkInput && vk && !vk.contains(e.target) && e.target !== activeVkInput) {
                closeKeyboard();
            }
        });
        document.addEventListener('touchstart', function(e) {
            const vk = document.getElementById('virtual-keyboard');
            if (activeVkInput && vk && !vk.contains(e.target) && e.target !== activeVkInput) {
                closeKeyboard();
            }
        }, {passive: true});

        function vkType(char) {
            if (activeVkInput) {
                activeVkInput.value += char;
                activeVkInput.focus(); // Jaga agar kursor fisik tetap berkedip di dalam kotak
                checkFormCompleteness(); 
            }
        }

        function vkBackspace() {
            if (activeVkInput && activeVkInput.value.length > 0) {
                activeVkInput.value = activeVkInput.value.slice(0, -1);
                activeVkInput.focus(); // Jaga agar kursor fisik tetap berkedip di dalam kotak
                checkFormCompleteness(); 
            }
        }

        // --- SISTEM PENGUNCIAN FORM (POKA-YOKE) ---
        function checkFormCompleteness() {
            if (isSpectator) return;
            const assy = document.getElementById('in-assy').value.trim();
            const cct = document.getElementById('in-cct').value.trim();
            const wp = document.getElementById('in-wp').value.trim();
            const qtyStr = document.getElementById('in-qty').value;
            const qty = parseInt(qtyStr);
            const btnSubmit = document.getElementById('btn-submit');
            const qtyEl = document.getElementById('in-qty');

            let isQtyValid = false;
            if (qtyStr !== "") {
                if (qty > 100) {
                    qtyEl.style.color = 'var(--danger)';
                    qtyEl.style.borderColor = 'var(--danger)';
                    qtyEl.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)';
                } else if (qty > 0) {
                    qtyEl.style.color = 'var(--text-main)';
                    qtyEl.style.borderColor = 'var(--primary)';
                    qtyEl.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                    isQtyValid = true;
                }
            } else {
                qtyEl.style.color = 'var(--text-main)';
                qtyEl.style.borderColor = 'var(--border)';
                qtyEl.style.boxShadow = 'none';
            }

            if (assy && cct && wp && isQtyValid) {
                btnSubmit.disabled = false;
            } else {
                btnSubmit.disabled = true;
            }
        }

        function lockForm() {
            const overlay = document.getElementById('form-overlay');
            if (overlay) overlay.classList.remove('hidden');
            
            const formCard = document.getElementById('form-card');
            if (formCard) formCard.style.opacity = '0.6';
            
            const status = document.getElementById('lock-status');
            if (status) {
                status.innerHTML = 'NO PROSES';
                status.style.background = '#fee2e2';
                status.style.color = 'var(--danger)';
            }
            
            ['in-assy', 'in-cct', 'in-wp', 'in-qty'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.disabled = true;
            });
            const btnSubmit = document.getElementById('btn-submit');
            if(btnSubmit) btnSubmit.disabled = true;
            closeKeyboard(); 
        }

        function unlockForm() {
            if(isSpectator) return;
            const overlay = document.getElementById('form-overlay');
            if (overlay) overlay.classList.add('hidden');
            
            const formCard = document.getElementById('form-card');
            if (formCard) formCard.style.opacity = '1';
            
            const status = document.getElementById('lock-status');
            if (status) {
                status.innerHTML = 'SEDANG PROSES';
                status.style.background = 'var(--success)';
                status.style.color = 'white';
            }
            
            ['in-assy', 'in-cct', 'in-wp', 'in-qty'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.disabled = false;
            });
            
            checkFormCompleteness(); 
        }

        function onPartInputLive(val) {
            handleVisualUpdate(val);
            const exactMatch = MASTER.parts.find(p => p.pn.toUpperCase() === val.trim().toUpperCase());
            if (exactMatch) {
                if (lastValidPart !== "" && lastValidPart !== exactMatch.pn && !editingId) {
                    ['in-assy', 'in-cct', 'in-wp', 'in-qty'].forEach(id => document.getElementById(id).value = '');
                    consecutiveSaves = 0; 
                    showToast('Material baru terdeteksi. Form telah di-reset.', 'info');
                }
                lastValidPart = exactMatch.pn;
                unlockForm(); 
            } else {
                lockForm(); 
            }
        }

        function openModal(id) { document.getElementById(id).style.display = 'flex'; }
        function closeModal(id) { document.getElementById(id).style.display = 'none'; }

        function showLoader() { document.getElementById('global-loader').classList.remove('hidden'); }
        function hideLoader() { document.getElementById('global-loader').classList.add('hidden'); }

        function executeWithLoader(taskFn) { showLoader(); setTimeout(() => { try { taskFn(); } catch (e) { console.error(e); } hideLoader(); }, 50); }

        window.addEventListener('beforeunload', function (e) { if (user && user.id !== "111" && !isIntentionalExit && !isSpectator) { e.preventDefault(); e.returnValue = ''; } });

        /* --- [10. LOGIKA WAKTU & TARGET (MES CORE)] --- */
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

        /* --- [11. INISIALISASI APLIKASI (ONLOAD)] --- */
        window.onload = () => {
            let dynamicUsers = []; try { dynamicUsers = JSON.parse(localStorage.getItem('dynamicUsers') || '[]'); } catch (e) {}
            MASTER.users = [...HARDCODED_USERS, ...dynamicUsers];

            document.querySelectorAll('.input').forEach(input => {
                input.addEventListener('focus', function() { this.select(); });
            });

            const lAssy = document.getElementById('list-assy'), lParts = document.getElementById('list-parts'), lPartsG = document.getElementById('list-parts-global');
            if (lAssy) { let h = ""; MASTER.assy.forEach(v => h += `<option value="${v}">`); lAssy.innerHTML = h; }
            if (lParts && lPartsG) { let h = ""; MASTER.parts.forEach(v => h += `<option value="${v.pn}">`); lParts.innerHTML = h; lPartsG.innerHTML = h; }
            
            document.getElementById('login-form').onsubmit = (e) => {
                e.preventDefault();
                const u = document.getElementById('login-username').value, p = document.getElementById('login-password').value;
                const match = MASTER.users.find(x => x.id === u && x.pass === p);
                if(match) { isTraining = false; executeWithLoader(() => login(match)); }
                else showToast("Lisensi ID atau Password Salah. Pastikan Admin telah membuatkan lisensi Anda.", "error");
            };

            const seq = ['in-part', 'in-assy', 'in-cct', 'in-wp', 'in-qty'];
            seq.forEach((id, i) => { 
                const el = document.getElementById(id); 
                if (el) {
                    el.onkeydown = (e) => { 
                        if (e.key === 'Enter') { 
                            e.preventDefault(); 
                            if (id === 'in-qty') {
                                const btnSubmit = document.getElementById('btn-submit');
                                if (!btnSubmit.disabled) {
                                    handleSave(); 
                                } else {
                                    const qtyVal = parseInt(document.getElementById('in-qty').value);
                                    if (qtyVal > 100) showToast('Blokir Sistem: Maksimal Qty adalah 100!', 'error');
                                    else showToast('Lengkapi SELURUH form (Assy, CCT, WP, Qty) terlebih dahulu!', 'error');
                                }
                            } else if (id === 'in-part') {
                                let val = el.value.trim().toUpperCase();
                                if (val) {
                                    const match = MASTER.parts.find(p => p.pn.toUpperCase().startsWith(val) || p.pn.toUpperCase().includes(val));
                                    if (match) {
                                        el.value = match.pn;
                                        onPartInputLive(match.pn); 
                                        if (seq[i+1]) document.getElementById(seq[i+1]).focus();
                                    } else {
                                        showToast('GAGAL: Part No tidak terdaftar di Database!', 'error');
                                        onPartInputLive('');
                                        el.focus();
                                        el.select();
                                    }
                                }
                            } else if (id === 'in-assy') {
                                let val = el.value.trim().toUpperCase();
                                if (val) {
                                    const match = MASTER.assy.find(a => a.toUpperCase().startsWith(val) || a.toUpperCase().includes(val));
                                    if (match) el.value = match;
                                }
                                if (seq[i+1]) document.getElementById(seq[i+1]).focus();
                            } else {
                                if (seq[i+1]) document.getElementById(seq[i+1]).focus(); 
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
                idleEventThrottle = setTimeout(() => {
                    resetIdleScrollTimer();
                    idleEventThrottle = null;
                }, 500); 
            }

            ['scroll', 'mousemove', 'keydown', 'touchstart'].forEach(evt => window.addEventListener(evt, handleIdleEvent, { passive: true }));
            resetIdleScrollTimer();
        };

        /* --- [12. ASYNC DRAG & DROP (FILE / FOLDER PARSER)] --- */
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
            if (jsonFiles.length === 0) { hideLoader(); showToast("Peringatan: Tidak ada file JSON yang ditemukan.", "error"); return; }

            let filesRead = 0;
            if (mode === 'sync') {
                let loadedUsers = [];
                jsonFiles.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try { const json = JSON.parse(e.target.result); if (json.id && json.name && json.pass && !Array.isArray(json)) loadedUsers.push(json); } catch(err) {}
                        filesRead++;
                        if (filesRead === jsonFiles.length) {
                            try { localStorage.setItem('dynamicUsers', JSON.stringify(loadedUsers)); MASTER.users = [...HARDCODED_USERS, ...loadedUsers]; closeModal('modal-import-license'); showToast(`Berhasil mensinkronisasi! Sebanyak ${loadedUsers.length} Lisensi MP terdaftar.`, 'success');
                            } catch(err) { MASTER.users = [...HARDCODED_USERS, ...loadedUsers]; closeModal('modal-import-license'); }
                            hideLoader();
                        }
                    }; reader.readAsText(file);
                });
            }
        }

        /* --- [13. LOGIKA OPERATOR (MANPOWER)] --- */
        function login(data) {
            user = { ...data }; isSpectator = false; document.getElementById('login-page').classList.add('hidden'); 
            
            document.getElementById('app-page').classList.remove('hidden');
            document.getElementById('floating-monitor').classList.remove('hidden'); 
            document.getElementById('ui-user').innerText = user.name.toUpperCase(); document.getElementById('ui-shift').innerText = user.shift; 
            
            if(isTraining && !user.pros) user.pros = "SIMULASI";

            const prosSelect = document.getElementById('ui-proses');
            if (!Array.from(prosSelect.options).some(opt => opt.value === user.pros)) { prosSelect.add(new Option(user.pros, user.pros)); }
            prosSelect.value = user.pros;
            
            const storageKey = `mp_records_cache_${user.id}`;
            if (!isTraining) { 
                try { let cachedRecords = JSON.parse(localStorage.getItem(storageKey)) || []; const now = Date.now(); records = cachedRecords.filter(r => (now - new Date(r.time).getTime()) < 172800000); } catch (e) { records = []; } 
            } else { records = []; } 
            
            reactivateInputs(); refreshUI(); 
            document.getElementById('in-part').focus(); 
            
            showToast(`Selamat datang di shift ini, ${user.name.toUpperCase()}!`, 'info');
        }

        function reactivateInputs() {
            document.getElementById('in-part').disabled = false;
            lockForm();
            
            document.getElementById('btn-submit').innerText = "ENTER"; 
            document.getElementById('btn-submit').className = "btn btn-primary"; 
            document.getElementById('btn-submit').style = "width:100%; padding: 14px; font-size: 15px; margin-top: auto;";
            document.getElementById('btn-end-shift').classList.remove('hidden'); 
            document.getElementById('spectator-warning').classList.add('hidden');
        }

        function activateSpectatorMode() {
            isSpectator = true;
            document.getElementById('in-part').disabled = true; 
            document.getElementById('in-assy').disabled = true; 
            document.getElementById('in-cct').disabled = true; 
            document.getElementById('in-wp').disabled = true; 
            document.getElementById('in-qty').disabled = true; 
            
            lockForm(); 
            
            const btnSubmit = document.getElementById('btn-submit');
            btnSubmit.innerText = "SHIFT BERAKHIR (TERKUNCI)"; 
            btnSubmit.className = "btn"; 
            btnSubmit.style.background = 'var(--border)'; 
            btnSubmit.style.color = 'var(--text-muted)';
            
            document.getElementById('btn-end-shift').classList.add('hidden'); 
            document.getElementById('spectator-warning').classList.remove('hidden');
            const actionBtns = document.querySelectorAll('.btn-edit, .btn-delete-row'); actionBtns.forEach(btn => btn.classList.add('hidden'));
            closeKeyboard();
        }

        function processEndShift(shiftRecords, currentSession) {
            showLoader();
            setTimeout(() => {
                const dataStr = JSON.stringify(shiftRecords, null, 2); const blob = new Blob([dataStr], { type: "application/json" }); const url = URL.createObjectURL(blob);
                const dateOnly = currentSession.split('_')[0]; const fileName = `${user.name.replace(/\s+/g, '_')}_${dateOnly}.json`;
                const a = document.createElement("a"); a.href = url; a.download = fileName; a.click(); URL.revokeObjectURL(url);
                
                setTimeout(() => {
                    activateSpectatorMode();
                    hideLoader();
                    showToast('Shift diakhiri. Data diamankan.', 'success');
                }, 2000);
            }, 50);
        }

        function endShift() {
            const currentSession = getSessionIdentifier(new Date()); 
            const shiftRecords = records.filter(r => getSessionIdentifier(r.time) === currentSession);
            
            if(shiftRecords.length === 0) {
                showToast("Belum ada data produksi yang bisa di-save di sesi shift ini.", "error");
                return;
            }

            document.getElementById('confirm-msg').innerText = "Apakah Anda yakin ingin mengakhiri shift dan mengunduh laporan? \n\nSistem akan masuk ke Mode Pengamat (Spectator Mode). Anda TIDAK AKAN BISA memasukkan data baru lagi untuk mencegah penyimpanan ganda.";
            document.getElementById('btn-confirm-ok').onclick = () => {
                closeModal('modal-confirm');
                processEndShift(shiftRecords, currentSession);
            };
            openModal('modal-confirm');
        }

        function logout() { isIntentionalExit = true; location.reload(); }
        function changeProcess(newPros) { user.pros = newPros; refreshUI(); }
        function startTraining() { openModal('modal-training'); document.getElementById('in-training-name').focus(); }
        function submitTrainingName() { let tName = document.getElementById('in-training-name').value.trim(); if (!tName) tName = "PESERTA TRAINING"; isTraining = true; closeModal('modal-training'); executeWithLoader(() => login({ id: "TRAINING", name: tName + " (TRN)", shift: "T", kat: "EDU", pros: "SIMULASI" })); }
        function openZoomModal(src) { if (!src || src.includes('undefined')) return; document.getElementById('zoom-img').src = src; openModal('modal-zoom'); }
        
        function updateImageSource(imgElement, placeholderElement, labelElement, path, label) {
            if (!imgElement || !placeholderElement || !labelElement) return;
            if (!path) { imgElement.classList.add('hidden'); labelElement.classList.add('hidden'); placeholderElement.classList.remove('hidden'); return; }
            imgElement.src = `sampleImage/${path}`; imgElement.style.cursor = 'zoom-in'; imgElement.onclick = () => openZoomModal(imgElement.src);
            imgElement.onload = () => { imgElement.classList.remove('hidden'); labelElement.classList.remove('hidden'); labelElement.innerText = label; placeholderElement.classList.add('hidden'); };
            imgElement.onerror = () => { imgElement.classList.add('hidden'); labelElement.classList.add('hidden'); placeholderElement.classList.remove('hidden'); placeholderElement.innerHTML = `<span style="background:var(--danger); color:white; padding:2px 6px; border-radius:4px; font-size:10px;">NO IMAGE</span><br>${label}`; };
        }

        function handleGlobalSearch(val) {
            executeWithLoader(() => {
                const part = MASTER.parts.find(p => p.pn === val);
                if (part) {
                    openModal('modal-search');
                    let simPath = part.sims && part.sims.length > 0 ? part.sims[0].img : "";
                    let simLabel = part.sims && part.sims.length > 0 ? part.sims[0].pn : "COMPARE";

                    updateImageSource(document.getElementById('search-img-part'), document.getElementById('search-img-part-ph'), document.getElementById('search-label-part-a'), part.img1, part.pn); 
                    updateImageSource(document.getElementById('search-img-loc'), document.getElementById('search-img-loc-ph'), document.getElementById('search-label-part-b'), simPath, simLabel);
                    
                    document.getElementById('search-ui-pn').innerText = part.pn; document.getElementById('search-ui-loc').innerText = part.loc; document.getElementById('search-ui-warning').classList.remove('hidden'); document.getElementById('search-img-b-container').classList.add('similar-part-highlight'); document.getElementById('search-img-a-container').classList.add('correct-part-highlight'); document.getElementById('search-badge-ok').classList.remove('hidden'); document.getElementById('search-badge-ng').classList.remove('hidden'); document.getElementById('global-search').value = ''; document.getElementById('global-search').blur();
                }
            });
        }
        
        function closeSearchModal() { closeModal('modal-search'); document.getElementById('search-img-b-container').classList.remove('similar-part-highlight'); document.getElementById('search-img-a-container').classList.remove('correct-part-highlight'); document.getElementById('search-badge-ok').classList.add('hidden'); document.getElementById('search-badge-ng').classList.add('hidden'); }
        
        // --- LOGIKA ROTASI GAMBAR (CAROUSEL) PART NG ---
        function startCarousel(imgEl, placeholderEl, labelEl, simsArray) {
            if (carouselIntervalId) { clearInterval(carouselIntervalId); carouselIntervalId = null; }
            if (!simsArray || simsArray.length === 0) return;

            let idx = 0;
            updateImageSource(imgEl, placeholderEl, labelEl, simsArray[idx].img, simsArray[idx].pn);

            if (simsArray.length > 1) {
                carouselIntervalId = setInterval(() => {
                    imgEl.style.opacity = '0'; 
                    labelEl.style.opacity = '0'; 
                    
                    setTimeout(() => {
                        idx = (idx + 1) % simsArray.length;
                        updateImageSource(imgEl, placeholderEl, labelEl, simsArray[idx].img, simsArray[idx].pn);
                        
                        imgEl.style.opacity = '1'; 
                        labelEl.style.opacity = '1'; 
                    }, 600); 
                }, 3000);
            }
        }

        function handleVisualUpdate(val) {
            const part = MASTER.parts.find(p => p.pn === val);
            const warningBox = document.getElementById('ui-warning');
            
            if (carouselIntervalId) { clearInterval(carouselIntervalId); carouselIntervalId = null; } 

            if(part) {
                updateImageSource(document.getElementById('view-a'), document.getElementById('view-a-ph'), document.getElementById('ui-label-part-a'), part.img1, part.pn); 
                startCarousel(document.getElementById('view-b'), document.getElementById('view-b-ph'), document.getElementById('ui-label-part-b'), part.sims);

                document.getElementById('ui-part-name').innerText = part.pn; document.getElementById('ui-part-loc').innerText = part.loc; 
                document.getElementById('view-b-container').classList.add('similar-part-highlight'); document.getElementById('view-a-container').classList.add('correct-part-highlight');
                document.getElementById('badge-ok').classList.remove('hidden'); document.getElementById('badge-ng').classList.remove('hidden');
                
                warningBox.className = 'warning-flashing';
                warningBox.innerHTML = '⚠ HATI-HATI MATERIAL SERUPA<br>PASTIKAN PART ACCESSORIES SESUAI DENGAN WOS!';
            } else {
                document.getElementById('view-a').classList.add('hidden'); document.getElementById('view-a-ph').classList.remove('hidden'); document.getElementById('ui-label-part-a').classList.add('hidden'); document.getElementById('view-b').classList.add('hidden'); document.getElementById('view-b-ph').classList.remove('hidden'); document.getElementById('ui-label-part-b').classList.add('hidden');
                document.getElementById('ui-part-name').innerText = '-'; document.getElementById('ui-part-loc').innerText = '-'; 
                document.getElementById('view-b-container').classList.remove('similar-part-highlight'); document.getElementById('view-a-container').classList.remove('correct-part-highlight');
                document.getElementById('badge-ok').classList.add('hidden'); document.getElementById('badge-ng').classList.add('hidden');
                
                warningBox.className = 'warning-standby';
                warningBox.innerHTML = 'STANDBY - MENUNGGU PART NO';
            }
        }
        
        function clearInputs() { 
            // Hanya bersihkan input form data (Assy, CCT, WP, Qty)
            ['in-assy', 'in-cct', 'in-wp', 'in-qty'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            }); 
            
            // Reset state Circuit Breaker
            consecutiveSaves = 0;
            lastSavedAssy = "";
            
            // Periksa ulang kelengkapan (akan mengunci tombol Enter karena form kosong)
            checkFormCompleteness();
            
            // Jika Part No masih terisi dan valid, jangan kunci form. Kembalikan fokus ke Assy No.
            const partInput = document.getElementById('in-part');
            if (partInput && partInput.value.trim() !== "") {
                const assyInput = document.getElementById('in-assy');
                if (assyInput && !assyInput.disabled) {
                    assyInput.focus();
                }
            } else {
                // Jika Part No juga kosong (misal dihapus manual), kunci form dan fokus ke Part No
                lockForm();
                if (partInput) partInput.focus();
            }
        }

        function handleSave() {
            if (isSpectator) return; 
            const data = { assy: document.getElementById('in-assy').value, cct: document.getElementById('in-cct').value, part: document.getElementById('in-part').value, wp: document.getElementById('in-wp').value, qty: document.getElementById('in-qty').value, time: new Date().toISOString(), userId: user.id, userName: user.name, userShift: user.shift, userPros: user.pros };
            if (!data.assy || !data.part || !data.qty) return;
            
            // Safety Validasi Database saat Save
            const isPartValid = MASTER.parts.some(p => p.pn === data.part);
            if (!isPartValid) {
                showToast('GAGAL SIMPAN: Part No tidak terdaftar!', 'error');
                lockForm();
                return;
            }

            // Circuit Breaker: Lacak Input Berulang Berdasarkan Assy No (WOS)
            if (data.assy === lastSavedAssy && !editingId) {
                consecutiveSaves += multiplier; 
            } else {
                consecutiveSaves = multiplier; 
                lastSavedAssy = data.assy;
            }

            if (editingId) { const index = records.findIndex(r => r.id === editingId); if (index !== -1) { data.id = editingId; data.time = records[index].time; records[index] = data; } editingId = null; } else { for (let i = 0; i < multiplier; i++) records.unshift({ ...data, id: Date.now() + i }); }
            
            multiplier = 1; 
            document.getElementById('ui-multiplier').innerText = ''; 
            
            document.getElementById('btn-submit').innerText = "ENTER"; 
            document.getElementById('btn-submit').className = "btn btn-primary"; 
            document.getElementById('ui-form-title').innerText = "Input Data WOS"; 
            document.getElementById('ui-form-title').style.color = "var(--text-main)"; 
            document.getElementById('btn-cancel-edit').classList.add('hidden'); 
            
            if (!isTraining) localStorage.setItem(`mp_records_cache_${user.id}`, JSON.stringify(records));
            refreshUI();

            if (consecutiveSaves >= 50) {
                ['in-assy', 'in-cct', 'in-wp', 'in-qty'].forEach(id => document.getElementById(id).value = '');
                consecutiveSaves = 0;
                lastSavedAssy = "";
                
                checkFormCompleteness(); 
                document.getElementById('in-assy').focus(); 
                
                showToast('Form di-reset', 'info');
            } else {
                document.getElementById('in-qty').value = ''; 
                checkFormCompleteness(); 
                document.getElementById('in-qty').focus(); 
                showToast('Data berhasil disimpan!');
            }
            closeKeyboard();
        }

        function startEdit(id) {
            if(isSpectator) return;
            const record = records.find(r => r.id === id); if (!record) return; editingId = id;
            
            document.getElementById('in-part').value = record.part;
            document.getElementById('in-assy').value = record.assy; 
            document.getElementById('in-cct').value = record.cct; 
            document.getElementById('in-wp').value = record.wp; 
            document.getElementById('in-qty').value = record.qty;
            
            document.getElementById('ui-form-title').innerText = "⚠ MODE EDIT DATA"; 
            document.getElementById('ui-form-title').style.color = "var(--warning)"; 
            document.getElementById('btn-submit').innerText = "UPDATE DATA"; 
            document.getElementById('btn-submit').className = "btn btn-update"; 
            document.getElementById('btn-cancel-edit').classList.remove('hidden');
            
            onPartInputLive(record.part); 
            document.getElementById('in-qty').focus(); 
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        function cancelEdit() { 
            editingId = null; 
            document.getElementById('btn-submit').innerText = "ENTER"; 
            document.getElementById('btn-submit').className = "btn btn-primary"; 
            document.getElementById('ui-form-title').innerText = "Input Data WOS"; 
            document.getElementById('ui-form-title').style.color = "var(--text-main)"; 
            document.getElementById('btn-cancel-edit').classList.add('hidden'); 
            clearInputs(); 
        }
        
        function deleteLog(id) { 
            if(isSpectator) return;
            executeWithLoader(() => { records = records.filter(r => r.id !== id); if (!isTraining) localStorage.setItem(`mp_records_cache_${user.id}`, JSON.stringify(records)); refreshUI(); });
        }

        function refreshUI() {
            const currentSession = getSessionIdentifier(new Date()); 
            const shiftRecords = records.filter(r => getSessionIdentifier(r.time) === currentSession);
            const total = shiftRecords.reduce((s, r) => s + Number(r.qty), 0), target = getTargetByProcess(user.pros);
            const targetHourly = Math.round(target / 8);
            
            const percent = Math.round((total / target) * 100);
            const displayPercent = percent + '%';
            const barWidth = Math.min(100, percent) + '%'; 
            
            document.getElementById('ui-total').innerText = total; 
            document.getElementById('ui-target').innerText = target;
            document.getElementById('ui-target-hourly').innerText = targetHourly;
            document.getElementById('ui-gap').innerText = total >= target ? "OK" : (total - target); document.getElementById('ui-gap').style.color = total >= target ? 'var(--success)' : 'var(--danger)';
            document.getElementById('ui-percent').innerText = displayPercent; 
            document.getElementById('ui-progress-bar').style.width = barWidth; 
            
            if(percent >= 100) { document.getElementById('ui-progress-bar').style.background = 'var(--success)'; document.getElementById('ui-percent').style.color = 'var(--success)'; }
            else { document.getElementById('ui-progress-bar').style.background = 'var(--primary)'; document.getElementById('ui-percent').style.color = 'var(--primary)'; }
            
            document.getElementById('ui-count').innerText = shiftRecords.length + ' WOS';

            const body = document.getElementById('main-table-body'); 
            
            let htmlBatch = ''; 
            const renderLimit = Math.min(shiftRecords.length, 30); 
            
            for (let i = 0; i < renderLimit; i++) {
                const r = shiftRecords[i];
                let actionBtns = `<button onclick="startEdit(${r.id})" class="btn btn-edit ${isSpectator ? 'hidden' : ''}">EDIT</button><button onclick="deleteLog(${r.id})" class="btn btn-delete-row ${isSpectator ? 'hidden' : ''}">HAPUS</button>`;
                htmlBatch += `<tr><td style="font-weight:600;">${r.assy}</td><td>${r.cct}</td><td style="font-weight:600;">${r.part}</td><td>${r.wp}</td><td style="text-align:center; font-weight:900; color:var(--primary); font-size:14px;">${r.qty}</td><td style="font-size:11px; opacity:0.7;">${new Date(r.time).toLocaleTimeString()}</td><td style="text-align:right; white-space:nowrap;">${actionBtns}</td></tr>`; 
            }
            
            if (shiftRecords.length > 30) {
                htmlBatch += `<tr><td colspan="7" style="text-align:center; font-size:10px; opacity:0.5; padding: 10px;">... ${shiftRecords.length - 30} data terdahulu disembunyikan agar komputer tetap ringan ...</td></tr>`;
            }
            
            body.innerHTML = htmlBatch; 
        }

        function openMultiplier(e) { if (e) e.preventDefault(); openModal('modal-mul'); document.getElementById('in-mul').focus(); }
        function applyMultiplier() { multiplier = parseInt(document.getElementById('in-mul').value) || 1; document.getElementById('ui-multiplier').innerText = multiplier > 1 ? `(x${multiplier})` : ''; closeModal('modal-mul'); }
        
        function openArchive(show) { 
            if(show) { 
                openModal('modal-arc'); 
                document.getElementById('arc-date').value = getShiftDateISO(new Date()); 
                executeWithLoader(renderArchiveTable); 
            } else { 
                closeModal('modal-arc'); 
            } 
        }

        function renderArchiveTable() { 
            const targetStr = document.getElementById('arc-date').value; if (!targetStr) return;
            const filtered = records.filter(r => { return getShiftDateISO(r.time) === targetStr; }); 
            filtered.sort((a, b) => new Date(b.time) - new Date(a.time));
            
            arcFilteredData = filtered;
            arcCurrentPage = 1;
            
            document.getElementById('arc-total').innerText = filtered.reduce((s, r) => s + Number(r.qty), 0); 
            document.getElementById('arc-wos-count').innerText = filtered.length + ' WOS';
            
            displayArcPage();
        }

        function displayArcPage() {
            const body = document.getElementById('archive-table-body'); 
            const paginationUI = document.getElementById('arc-pagination');
            if (!body) return; body.innerHTML = ''; 
            
            if(arcFilteredData.length === 0) { 
                body.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; opacity: 0.5;">Tidak ada riwayat pada tanggal ini.</td></tr>'; 
                paginationUI.classList.add('hidden');
                return; 
            } 
            
            paginationUI.classList.remove('hidden');
            const startIndex = (arcCurrentPage - 1) * ARC_PER_PAGE;
            const endIndex = startIndex + ARC_PER_PAGE;
            const paginatedItems = arcFilteredData.slice(startIndex, endIndex);

            let arcHtmlBatch = ''; 
            paginatedItems.forEach(r => { 
                arcHtmlBatch += `<tr><td style="font-weight:600;">${r.assy}</td><td>${r.cct}</td><td style="font-weight:600;">${r.part}</td><td style="text-align:center; font-weight:900; color:var(--primary); font-size:14px;">${r.qty}</td><td style="font-size:11px; opacity:0.7;">${new Date(r.time).toLocaleString('id-ID')}</td></tr>`; 
            });
            body.innerHTML = arcHtmlBatch;
            
            const totalPages = Math.ceil(arcFilteredData.length / ARC_PER_PAGE) || 1;
            document.getElementById('arc-page-info').innerText = `Halaman ${arcCurrentPage} dari ${totalPages}`;
            document.getElementById('btn-arc-prev').disabled = arcCurrentPage === 1;
            document.getElementById('btn-arc-next').disabled = arcCurrentPage === totalPages;
        }

        // FUNGSI TOGGLE NAVIGASI MELAYANG
        function toggleMonitor() {
            const panel = document.getElementById('floating-monitor');
            if (!panel) return;

            if (panel.classList.contains('open')) {
                panel.classList.remove('open');
            } else {
                panel.classList.add('open');
            }
        }

        function exportArchiveJSON() {
            const targetStr = document.getElementById('arc-date').value; if (!targetStr) { showToast("Pilih tanggal terlebih dahulu.", "error"); return; }
            const filtered = records.filter(r => getShiftDateISO(r.time) === targetStr); if(filtered.length === 0) { showToast("Tidak ada data untuk diunduh pada tanggal tersebut.", "error"); return; }
            const dataStr = JSON.stringify(filtered, null, 2); const blob = new Blob([dataStr], { type: "application/json" }); const url = URL.createObjectURL(blob);
            const fileName = `${user.name.replace(/\s+/g, '_')}_${targetStr}.json`; const a = document.createElement("a"); a.href = url; a.download = fileName; a.click(); URL.revokeObjectURL(url);
        }

        function resetIdleScrollTimer() {
            if (isSpectator) return; 
            clearTimeout(idleScrollTimer);
            
            idleScrollTimer = setTimeout(() => {
                if (window.scrollY > 150) { 
                    smoothScrollToTop(1200); 
                }
            }, 15000); 
        }

        function smoothScrollToTop(duration) {
            const startPosition = window.pageYOffset;
            const startTime = performance.now();

            function easeInOutCubic(t) {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }

            function animation(currentTime) {
                const timeElapsed = currentTime - startTime;
                let progress = timeElapsed / duration;
                if (progress > 1) progress = 1;

                const easeProgress = easeInOutCubic(progress);
                window.scrollTo(0, startPosition * (1 - easeProgress));

                if (progress < 1) {
                    requestAnimationFrame(animation);
                } else {
                    const qtyInput = document.getElementById('in-qty');
                    const partInput = document.getElementById('in-part');
                    
                    if (qtyInput && !qtyInput.disabled) {
                        qtyInput.focus();
                    } else if (partInput && !partInput.disabled) {
                        partInput.focus();
                    }
                }
            }
            requestAnimationFrame(animation);
        }