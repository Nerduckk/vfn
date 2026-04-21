// ========================================
// EDIT MODE: Kéo thả asset thật để căn chỉnh
// ========================================
let editMode = false;
let selectedEditableAsset = null;
let activeDrag = null;
const editStorageKey = 'vfn-lake-asset-layout-v1';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmallViewport = window.matchMedia('(max-width: 767px)').matches;
let pointerFrame = null;

const editModeBtn = document.getElementById('edit-mode-btn');
const editPanel = document.getElementById('edit-panel');
const coordsOutput = document.getElementById('coordinates-output');
const clearCoordsBtn = document.getElementById('clear-coords-btn');
const editImageSrcInput = document.getElementById('edit-image-src');
const applyImageBtn = document.getElementById('apply-image-btn');
const saveLayoutBtn = document.getElementById('save-layout-btn');
const copyAllCodeBtn = document.getElementById('copy-all-code-btn');
const codeOutput = document.getElementById('code-output');
const ZALO_PERSONAL_NUMBER = '0917656016';
const ZALO_PERSONAL_URL = `https://zalo.me/${ZALO_PERSONAL_NUMBER}`;
const shouldRestoreSavedLayout = new URLSearchParams(window.location.search).get('edit') === '1';
let journeyInitialized = false;
let preloadRunId = 0;
let autoEnterTimeoutId = null;
let audioUnlockBound = false;
let introAssetFailures = [];
let runtimeAssetBlobUrls = new Map();
let runtimeAssetStyleEl = null;
const ASSET_FETCH_TIMEOUT_MS = 30000;
const AUTO_ENTER_DELAY_MS = 1200;

function forceScrollTop() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
}

function tryStartAmbientAudio() {
    if (!ambientAudio) return;
    ambientAudio.volume = 0;
    ambientAudio.play()
        .then(() => {
            if (typeof gsap !== 'undefined') {
                gsap.to(ambientAudio, { volume: 0.5, duration: 3, overwrite: 'auto' });
            } else {
                ambientAudio.volume = 0.5;
            }
            window._audioZoneStarted = true;
        })
        .catch(() => {
            window._audioZoneStarted = false;
        });
}

function bindAudioUnlock() {
    if (audioUnlockBound) return;
    audioUnlockBound = true;

    const unlock = () => {
        if (!journeyInitialized || window._audioZoneStarted) return;
        tryStartAmbientAudio();
    };

    ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach((eventName) => {
        window.addEventListener(eventName, unlock, { passive: true });
    });
}

window._resumeVfnAudio = () => {
    bindAudioUnlock();
    tryStartAmbientAudio();
};

function setupNodeActionButtons() {
    if (typeof bootstrap === 'undefined') return;

    const nodeModalEl = document.getElementById('modalNodeAction');
    const nodeModalTitle = document.getElementById('modalNodeActionLabel');
    const nodeModalBody = document.getElementById('modalNodeActionBody');
    const nodeModalCta = document.getElementById('modalNodeActionCta');
    const nodeModal = nodeModalEl ? bootstrap.Modal.getOrCreateInstance(nodeModalEl) : null;

    document.querySelectorAll('.js-node-action-btn').forEach((btn) => {
        if (btn.dataset.bound === '1') return;
        btn.dataset.bound = '1';

        btn.addEventListener('click', (event) => {
            event.preventDefault();
            const action = btn.dataset.nodeAction;

            if (action === 'node-7') {
                if (!nodeModal || !nodeModalTitle || !nodeModalBody || !nodeModalCta) return;

                const rect = btn.getBoundingClientRect();
                const pressX = `${((event.clientX || rect.left + rect.width / 2) - rect.left).toFixed(1)}px`;
                const pressY = `${((event.clientY || rect.top + rect.height / 2) - rect.top).toFixed(1)}px`;
                btn.style.setProperty('--press-x', pressX);
                btn.style.setProperty('--press-y', pressY);
                btn.classList.remove('is-pressed-wow');
                void btn.offsetWidth;
                btn.classList.add('is-pressed-wow');

                nodeModalTitle.textContent = 'Tầng Sâu Nữa';
                nodeModalBody.innerHTML = `
                    <section class="node-insight-hero">
                        <div class="node-insight-hero-copy">
                            <div class="node-insight-kicker">Tầng sâu 02 • Tín hiệu hồi sinh</div>
                            <div class="node-insight-headline">Mặt hồ không chỉ<br>còn tồn tại.<br>Nó bắt đầu sống lại.</div>
                            <p class="node-insight-copy">Ở độ sâu này, sự sống quay về không phải như một đốm sáng nhỏ, mà như một cấu trúc mới đang lặng lẽ dựng lên dưới nước: đàn cá có nhịp, tầng cây có lớp, và mặt hồ bắt đầu giữ được hơi thở của chính nó.</p>
                        </div>
                        <div class="node-insight-hero-panel">
                            <div class="node-insight-panel-label">Spotlight</div>
                            <div class="node-insight-panel-value">72%</div>
                            <p>Không gian thị giác giờ được lấp đầy bởi chuyển động có tổ chức, thay vì những tín hiệu sống rời rạc.</p>
                        </div>
                    </section>
                    <section class="node-insight-pulse">
                        <div class="node-insight-pulse-ring"></div>
                        <div class="node-insight-pulse-core"></div>
                        <div class="node-insight-pulse-text">
                            <div class="node-insight-label">Tâm điểm</div>
                            <strong>Hồ đã qua ngưỡng chịu đựng.</strong>
                            <span>Nó đang bước vào pha tự hồi phục.</span>
                        </div>
                    </section>
                    <section class="node-insight-grid">
                        <article class="node-insight-card">
                            <div class="node-insight-label">Dấu hiệu 01</div>
                            <div class="node-insight-metric">Đàn</div>
                            <p>Cá không còn bơi như những chiếc bóng đơn độc. Chúng trở lại theo cụm, tạo thành cảm giác mặt hồ đã đủ an toàn để giữ một nhịp sống ổn định.</p>
                        </article>
                        <article class="node-insight-card">
                            <div class="node-insight-label">Dấu hiệu 02</div>
                            <div class="node-insight-metric">Lớp</div>
                            <p>Thực vật ngập nước bắt đầu xếp tầng. Mỗi lớp thêm vào là một tầng trú ẩn mới, một cấu trúc sinh thái mới đang được dựng lại từ bóng tối.</p>
                        </article>
                        <article class="node-insight-card">
                            <div class="node-insight-label">Dấu hiệu 03</div>
                            <div class="node-insight-metric">Nhịp</div>
                            <p>Nước tối hơn, chậm hơn, nhưng không tắt. Chính độ lắng này cho thấy hồ không còn chống đỡ, mà đang tự cân bằng trở lại.</p>
                        </article>
                    </section>
                    <section class="node-insight-storyline">
                        <div class="node-insight-story-step">
                            <span>01</span>
                            <p>Từ những chuyển động rời rạc, sự sống bắt đầu kết nối thành cụm.</p>
                        </div>
                        <div class="node-insight-story-step">
                            <span>02</span>
                            <p>Từ vài mảng xanh nhỏ, tầng thực vật bắt đầu tạo nơi trú ẩn thật sự.</p>
                        </div>
                        <div class="node-insight-story-step">
                            <span>03</span>
                            <p>Từ một mặt hồ chỉ còn chịu đựng, nhịp tự hồi phục đã quay lại.</p>
                        </div>
                    </section>
                    <div class="node-insight-voice">
                        <p>"Đây là khoảnh khắc mặt hồ thôi chống chọi với tổn thương, và bắt đầu hồi sinh bằng chính nhịp thở của nó."</p>
                    </div>
                `;
                nodeModalCta.classList.add('d-none');
                window.setTimeout(() => {
                    nodeModal.show();
                }, 180);
                window.setTimeout(() => {
                    btn.classList.remove('is-pressed-wow');
                }, 720);
                return;
            }

            if (action === 'node-8') {
                window.location.href = 'join.html';
            }
        });
    });
}

function setupZaloChatWidget() {
    const toggle = document.getElementById('zalo-chat-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
        window.open(ZALO_PERSONAL_URL, '_blank', 'noopener,noreferrer');
    });
}

function normalizeAssetRef(ref) {
    return (ref || '').trim().replace(/^\.?\//, '');
}

function inferAssetType(ref) {
    const cleanRef = normalizeAssetRef(ref).toLowerCase();
    if (/\.(mp3|wav|ogg|m4a)(\?.*)?$/.test(cleanRef)) return 'audio';
    if (/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/.test(cleanRef)) return 'image';
    return 'binary';
}

function createTimeoutController(timeoutMs) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(new DOMException('Timed out', 'AbortError')), timeoutMs);
    return {
        controller,
        clear() {
            window.clearTimeout(timeoutId);
        }
    };
}

async function fetchTextWithTimeout(url, timeoutMs = ASSET_FETCH_TIMEOUT_MS) {
    const pending = createTimeoutController(timeoutMs);
    try {
        const response = await fetch(url, {
            cache: 'reload',
            credentials: 'same-origin',
            signal: pending.controller.signal
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.text();
    } finally {
        pending.clear();
    }
}

async function fetchBlobWithTimeout(url, timeoutMs = ASSET_FETCH_TIMEOUT_MS) {
    const pending = createTimeoutController(timeoutMs);
    try {
        const response = await fetch(url, {
            cache: 'reload',
            credentials: 'same-origin',
            signal: pending.controller.signal
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.blob();
    } finally {
        pending.clear();
    }
}

function extractCssAssetUrls(cssText) {
    const urls = new Set();
    const pattern = /url\((['"]?)(assets\/[^'")]+)\1\)/g;
    let match;
    while ((match = pattern.exec(cssText)) !== null) {
        urls.add(normalizeAssetRef(match[2]));
    }
    return Array.from(urls);
}

async function collectLocalStylesheets() {
    const sheets = [];
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

    for (const link of links) {
        const href = link.getAttribute('href');
        if (!href) continue;

        try {
            const url = new URL(href, window.location.href);
            if (url.origin !== window.location.origin) continue;
            const text = await fetchTextWithTimeout(url.href);
            sheets.push({ href: url.href, text });
        } catch (_) {
            // Keep going; stylesheet fetch issues will surface via missing CSS assets later.
        }
    }

    return sheets;
}

function getImageAssetRefs() {
    return Array.from(document.querySelectorAll('img'))
        .map((img) => normalizeAssetRef(img.dataset.assetRef || img.getAttribute('src')))
        .filter((src) => src.startsWith('assets/'));
}

function getAudioAssetRefs() {
    return Array.from(document.querySelectorAll('audio source'))
        .map((source) => normalizeAssetRef(source.dataset.assetRef || source.getAttribute('src')))
        .filter((src) => src.startsWith('assets/'));
}

function revokeRuntimeAssetBlobUrls() {
    for (const blobUrl of runtimeAssetBlobUrls.values()) {
        URL.revokeObjectURL(blobUrl);
    }
    runtimeAssetBlobUrls.clear();
}

async function decodeImageBlob(blob) {
    const tempUrl = URL.createObjectURL(blob);
    try {
        await new Promise((resolve, reject) => {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('decode-error'));
            img.src = tempUrl;
        });
    } finally {
        URL.revokeObjectURL(tempUrl);
    }
}

async function preloadAssetRef(ref) {
    const normalizedRef = normalizeAssetRef(ref);
    const type = inferAssetType(normalizedRef);
    const url = new URL(normalizedRef, window.location.href).href;

    try {
        const blob = await fetchBlobWithTimeout(url);
        if (type === 'image') {
            await decodeImageBlob(blob);
        }
        const blobUrl = URL.createObjectURL(blob);
        return {
            ok: true,
            url: normalizedRef,
            label: normalizedRef.split('/').pop() || normalizedRef,
            type,
            blobUrl
        };
    } catch (error) {
        return {
            ok: false,
            url: normalizedRef,
            label: normalizedRef.split('/').pop() || normalizedRef,
            type,
            reason: error?.name === 'AbortError' ? 'timeout' : (error?.message || 'fetch-error')
        };
    }
}

function applyBlobUrlsToImages(blobUrlMap) {
    document.querySelectorAll('img').forEach((img) => {
        const originalRef = normalizeAssetRef(img.dataset.assetRef || img.getAttribute('src'));
        if (!originalRef.startsWith('assets/')) return;
        const blobUrl = blobUrlMap.get(originalRef);
        if (!blobUrl) return;
        img.dataset.assetRef = originalRef;
        img.loading = 'eager';
        img.decoding = 'async';
        img.src = blobUrl;
    });
}

function applyBlobUrlsToAudios(blobUrlMap) {
    document.querySelectorAll('audio').forEach((audio) => {
        const source = audio.querySelector('source');
        if (!source) return;
        const originalRef = normalizeAssetRef(source.dataset.assetRef || source.getAttribute('src'));
        if (!originalRef.startsWith('assets/')) return;
        const blobUrl = blobUrlMap.get(originalRef);
        if (!blobUrl) return;
        source.dataset.assetRef = originalRef;
        source.src = blobUrl;
        audio.load();
    });
}

function ensureRuntimeAssetStyleEl() {
    if (runtimeAssetStyleEl) return runtimeAssetStyleEl;
    runtimeAssetStyleEl = document.createElement('style');
    runtimeAssetStyleEl.id = 'runtime-asset-style-overrides';
    document.head.appendChild(runtimeAssetStyleEl);
    return runtimeAssetStyleEl;
}

function applyBlobUrlsToStylesheets(stylesheets, blobUrlMap) {
    const styleEl = ensureRuntimeAssetStyleEl();
    const rewrittenCss = stylesheets
        .map(({ text }) => text.replace(/url\((['"]?)(assets\/[^'")]+)\1\)/g, (full, quote, assetRef) => {
            const blobUrl = blobUrlMap.get(normalizeAssetRef(assetRef));
            if (!blobUrl) return full;
            return `url("${blobUrl}")`;
        }))
        .join('\n');

    styleEl.textContent = rewrittenCss;
}

async function prepareIntroAssets() {
    const currentRunId = ++preloadRunId;
    const enterBtnText = btnEnter?.querySelector('.btn-text');
    introAssetFailures = [];

    if (btnEnter) {
        btnEnter.disabled = true;
        btnEnter.removeAttribute('title');
    }

    const updateProgressText = (loaded, total) => {
        if (!enterBtnText) return;
        const percent = Math.round((loaded / total) * 100);
        enterBtnText.textContent = `ĐANG KIỂM TRA TÀI NGUYÊN... ${percent}%`;
    };

    const stylesheets = await collectLocalStylesheets();
    const cssAssetRefs = stylesheets.flatMap(({ text }) => extractCssAssetUrls(text));
    const manifest = Array.from(new Set([
        ...getImageAssetRefs(),
        ...getAudioAssetRefs(),
        ...cssAssetRefs
    ]));
    const totalTargets = Math.max(manifest.length, 1);
    let loadedTargets = 0;

    updateProgressText(loadedTargets, totalTargets);

    const results = await Promise.all([
        ...manifest.map((assetRef) =>
            preloadAssetRef(assetRef).finally(() => {
                loadedTargets += 1;
                if (currentRunId !== preloadRunId) return;
                updateProgressText(loadedTargets, totalTargets);
            })
        )
    ]);

    if (currentRunId !== preloadRunId) return;

    introAssetFailures = results.filter((result) => !result.ok);

    if (introAssetFailures.length > 0) {
        if (btnEnter) {
            btnEnter.disabled = false;
            btnEnter.title = introAssetFailures.map((item) => `${item.type}: ${item.url}`).slice(0, 8).join('\n');
        }
        if (enterBtnText) {
            enterBtnText.textContent = `THIẾU ${introAssetFailures.length} ASSET • BẤM ĐỂ KIỂM TRA LẠI`;
        }
        console.error('Missing or failed intro assets:', introAssetFailures);
        return;
    }

    const nextBlobUrlMap = new Map(results.map((result) => [result.url, result.blobUrl]));
    revokeRuntimeAssetBlobUrls();
    runtimeAssetBlobUrls = nextBlobUrlMap;
    applyBlobUrlsToImages(runtimeAssetBlobUrls);
    applyBlobUrlsToAudios(runtimeAssetBlobUrls);
    applyBlobUrlsToStylesheets(stylesheets, runtimeAssetBlobUrls);

    if (btnEnter) {
        btnEnter.disabled = false;
    }
    if (enterBtnText) {
        enterBtnText.textContent = 'BẮT ĐẦU HÀNH TRÌNH';
    }

    if (!journeyInitialized && btnEnter) {
        window.clearTimeout(autoEnterTimeoutId);
        autoEnterTimeoutId = window.setTimeout(() => {
            if (!journeyInitialized) {
                btnEnter.click();
            }
        }, AUTO_ENTER_DELAY_MS);
    }
}

function getEditableAssets() {
    return Array.from(document.querySelectorAll('.asset-frame'));
}

function assetLabel(el) {
    const img = el?.querySelector('img');
    return img?.getAttribute('alt') || img?.getAttribute('src')?.split('/').pop() || 'asset';
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function toViewportUnit(value, axis = 'x') {
    const viewport = axis === 'x' ? window.innerWidth : window.innerHeight;
    const unit = axis === 'x' ? 'vw' : 'vh';
    return `${((value / viewport) * 100).toFixed(2)}${unit}`;
}

function getAssetMeasurements(el) {
    const parentRect = el.parentElement?.getBoundingClientRect();
    const rect = el.getBoundingClientRect();

    if (!parentRect) {
        return {
            top: el.style.top || '0vh',
            left: el.style.left || '0vw',
            width: el.style.width || 'auto',
            height: el.style.height || 'auto'
        };
    }

    return {
        top: toViewportUnit(rect.top - parentRect.top, 'y'),
        left: toViewportUnit(rect.left - parentRect.left, 'x'),
        width: toViewportUnit(rect.width, 'x'),
        height: toViewportUnit(rect.height, 'y')
    };
}

function buildStyleString(el) {
    const metrics = getAssetMeasurements(el);
    return `style="top: ${metrics.top}; left: ${metrics.left}; width: ${metrics.width}; height: ${metrics.height};"`;
}

function syncControlsToSelection(el) {
    const img = el?.querySelector('img');

    if (editImageSrcInput) {
        editImageSrcInput.value = img?.getAttribute('src') || '';
    }
}

function exportEditableAssetsHtml() {
    return getEditableAssets().map((asset) => {
        const img = asset.querySelector('img');
        if (!img) return '';

        asset.style.top = getAssetMeasurements(asset).top;
        asset.style.left = getAssetMeasurements(asset).left;
        asset.style.width = getAssetMeasurements(asset).width;
        asset.style.height = getAssetMeasurements(asset).height;

        const src = img.getAttribute('src') || '';
        const alt = img.getAttribute('alt') || '';
        const classes = asset.className;
        const idAttr = asset.dataset.editId ? ` data-edit-id="${asset.dataset.editId}"` : '';
        const assetStyle = asset.getAttribute('style') ? ` style="${asset.getAttribute('style')}"` : '';
        return `<div class="${classes}"${idAttr}${assetStyle}>\n    <img class="${img.className}" src="${src}" alt="${alt}">\n</div>`;
    }).filter(Boolean).join('\n\n');
}

function updateCodeOutput() {
    if (!codeOutput) return;
    codeOutput.value = exportEditableAssetsHtml();
}

function serializeEditableAssets() {
    return getEditableAssets().map((asset) => {
        const img = asset.querySelector('img');
        const metrics = getAssetMeasurements(asset);
        return {
            id: asset.dataset.editId,
            top: metrics.top,
            left: metrics.left,
            width: metrics.width,
            height: metrics.height,
            src: img?.getAttribute('src') || ''
        };
    });
}

function persistEditableAssets() {
    try {
        window.localStorage.setItem(editStorageKey, JSON.stringify(serializeEditableAssets()));
    } catch (_) {
        // Ignore storage failures in constrained contexts.
    }
    updateCodeOutput();
}

function applyAssetState(asset, state) {
    const img = asset.querySelector('img');
    if (!img || !state) return;

    if (state.top) asset.style.top = state.top;
    if (state.left) asset.style.left = state.left;
    if (state.width) asset.style.width = state.width;
    if (state.height) asset.style.height = state.height;
    if (state.src) img.setAttribute('src', state.src);
}

function restoreEditableAssets() {
    try {
        const raw = window.localStorage.getItem(editStorageKey);
        if (!raw) {
            updateCodeOutput();
            return;
        }

        const saved = JSON.parse(raw);
        if (!Array.isArray(saved)) return;

        saved.forEach((state) => {
            const asset = document.querySelector(`.asset-frame[data-edit-id="${state.id}"]`);
            if (asset) {
                applyAssetState(asset, state);
            }
        });
        updateCodeOutput();
    } catch (_) {
        updateCodeOutput();
    }
}

function renderSelectedAsset(el) {
    if (!coordsOutput) return;
    if (!el) {
        coordsOutput.innerHTML = '<div class="small opacity-75">Chọn một asset rồi kéo trực tiếp để xem tọa độ.</div>';
        return;
    }

    const styleStr = buildStyleString(el);
    const parentName = el.parentElement?.className?.split(' ')[0] || 'parent';
    coordsOutput.innerHTML = `
        <div class="mb-3 p-3 bg-secondary rounded" style="border-left: 3px solid #ffc107;">
            <div style="font-weight: bold; margin-bottom: 6px; color: #ffc107;">${assetLabel(el)}</div>
            <div class="small opacity-75" style="margin-bottom: 6px;">ID: ${el.dataset.editId || 'no-id'}</div>
            <div class="small opacity-75" style="margin-bottom: 6px;">Parent: ${parentName}</div>
            <code style="font-size: 11px; word-break: break-all; display: block; margin-top: 5px;">${styleStr}</code>
            <code style="font-size: 11px; word-break: break-all; display: block; margin-top: 8px;">&lt;img src="${el.querySelector('img')?.getAttribute('src') || ''}"&gt;</code>
            <button id="copy-current-style-btn" class="btn btn-sm btn-info mt-2">Copy style</button>
        </div>
    `;

    document.getElementById('copy-current-style-btn')?.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(styleStr);
        } catch (_) {
            // Ignore clipboard failures in constrained contexts.
        }
    });
}

function selectEditableAsset(el) {
    getEditableAssets().forEach(asset => asset.classList.toggle('edit-selected', asset === el));
    selectedEditableAsset = el;
    syncControlsToSelection(el);
    renderSelectedAsset(el);
}

function toggleEditMode() {
    editMode = !editMode;
    document.body.classList.toggle('edit-mode-active', editMode);

    if (editPanel) {
        editPanel.style.display = editMode ? 'block' : 'none';
    }

    if (editModeBtn) {
        editModeBtn.style.backgroundColor = editMode ? '#28a745' : '#ffc107';
        editModeBtn.textContent = editMode ? '✓ Đang căn chỉnh' : '✏️ Chế độ căn chỉnh';
    }

    if (!editMode) {
        activeDrag = null;
        selectEditableAsset(null);
    } else {
        renderSelectedAsset(null);
    }
}

if (editModeBtn && editPanel) {
    editModeBtn.addEventListener('click', toggleEditMode);
}

clearCoordsBtn?.addEventListener('click', () => {
    selectEditableAsset(null);
});

applyImageBtn?.addEventListener('click', () => {
    if (!selectedEditableAsset || !editImageSrcInput) return;
    const img = selectedEditableAsset.querySelector('img');
    const nextSrc = editImageSrcInput.value.trim();
    if (!img || !nextSrc) return;
    img.setAttribute('src', nextSrc);
    renderSelectedAsset(selectedEditableAsset);
    updateCodeOutput();
});

saveLayoutBtn?.addEventListener('click', () => {
    persistEditableAssets();
});

copyAllCodeBtn?.addEventListener('click', async () => {
    updateCodeOutput();
    try {
        await navigator.clipboard.writeText(codeOutput?.value || '');
    } catch (_) {
        // Ignore clipboard failures.
    }
});

document.addEventListener('pointerdown', (event) => {
    if (!editMode) return;

    const asset = event.target.closest('.asset-frame');
    if (!asset) return;

    event.preventDefault();
    selectEditableAsset(asset);

    const parentRect = asset.parentElement?.getBoundingClientRect();
    const assetRect = asset.getBoundingClientRect();
    if (!parentRect) return;

    activeDrag = {
        asset,
        parentRect,
        offsetX: event.clientX - assetRect.left,
        offsetY: event.clientY - assetRect.top
    };

    asset.setPointerCapture?.(event.pointerId);
});

document.addEventListener('pointermove', (event) => {
    if (!editMode || !activeDrag) return;

    const { asset, parentRect, offsetX, offsetY } = activeDrag;
    const widthPx = asset.offsetWidth;
    const heightPx = asset.offsetHeight;

    const nextLeftPx = clamp(event.clientX - parentRect.left - offsetX, 0, Math.max(0, parentRect.width - widthPx));
    const nextTopPx = clamp(event.clientY - parentRect.top - offsetY, 0, Math.max(0, parentRect.height - heightPx));

    asset.style.left = `${((nextLeftPx / window.innerWidth) * 100).toFixed(2)}vw`;
    asset.style.top = `${((nextTopPx / window.innerHeight) * 100).toFixed(2)}vh`;

    renderSelectedAsset(asset);
    updateCodeOutput();
});

function endAssetDrag(event) {
    if (!activeDrag) return;

    activeDrag.asset.releasePointerCapture?.(event.pointerId);
    renderSelectedAsset(activeDrag.asset);
    activeDrag = null;
}

document.addEventListener('pointerup', endAssetDrag);
document.addEventListener('pointercancel', endAssetDrag);

if (shouldRestoreSavedLayout) {
    restoreEditableAssets();
} else {
    updateCodeOutput();
}
setupZaloChatWidget();

// ----------------------------------------
// 1. SPLASH SCREEN LOGIC (CINEMATIC)
// ----------------------------------------
const welcomeScreen = document.getElementById('welcome-screen');
const btnEnter = document.getElementById('btn-enter');
const ambientAudio = document.getElementById('ambient-audio');

function resetIntroState() {
    journeyInitialized = false;
    window._audioZoneStarted = false;
    window.clearTimeout(autoEnterTimeoutId);
    forceScrollTop();
    document.body.classList.add('no-scroll');
    document.getElementById('main-menu-btn')?.classList.add('d-none');
    welcomeScreen?.classList.remove('hidden');
    [ambientAudio, document.getElementById('dive-audio'), document.getElementById('under-audio')]
        .forEach((audio) => {
            if (!audio) return;
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 0;
        });

    if (typeof gsap !== 'undefined') {
        gsap.set('#world-canvas', { clearProps: 'transform' });
        gsap.set('.underwater-veil, .waterline-glow, .surface-content, .mound-wrap, .tall-plant-cluster, .stars-container', {
            clearProps: 'opacity,visibility,filter,scale,rotation,rotationX,x,y,yPercent'
        });
        gsap.set('.horizon-group, .p-far, .p-mid, .p-near, .underwater-cutout', {
            clearProps: 'visibility,scale,rotation,rotationX,x,y,yPercent'
        });
    }
}

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.addEventListener('load', () => {
    resetIntroState();
    prepareIntroAssets().catch(() => {});
}, { once: true });
window.addEventListener('pageshow', (event) => {
    resetIntroState();
    prepareIntroAssets().catch(() => {});
});

btnEnter?.addEventListener('click', () => {
    if (journeyInitialized) return;
    if (introAssetFailures.length > 0) {
        prepareIntroAssets().catch(() => {});
        return;
    }
    journeyInitialized = true;

    // 1. Try to start ambient audio. If autoplay is blocked, first user interaction will unlock it.
    tryStartAmbientAudio();
    bindAudioUnlock();

    // 2. Cinematic Zoom Transition
    const tl = gsap.timeline({
        onComplete: () => {
            welcomeScreen.classList.add('hidden');
            document.body.classList.remove('no-scroll');
            forceScrollTop();
            initJourney();
        }
    });

    tl.to(".welcome-content-wrap", { scale: 1.5, opacity: 0, duration: 1.2, ease: "power2.in" })
      .to(".mist-layer", { scale: 2, opacity: 0, duration: 1.5, ease: "power2.in" }, 0)
      .to(welcomeScreen, { backgroundColor: "transparent", duration: 1.5 }, 0.5)
      .call(() => {
          document.getElementById('main-menu-btn').classList.remove('d-none');
      });
});


// Mouse Parallax for Welcome Screen
if (!prefersReducedMotion && !isSmallViewport) {
    window.addEventListener('mousemove', (e) => {
        if (welcomeScreen.classList.contains('hidden') || pointerFrame) return;

        pointerFrame = window.requestAnimationFrame(() => {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

            gsap.to(".shimmer-text", { x: moveX * 2, y: moveY * 2, duration: 1.2, overwrite: "auto", ease: "power2.out" });
            gsap.to(".mist-1", { x: -moveX, y: -moveY, duration: 1.6, overwrite: "auto", ease: "power2.out" });
            gsap.to(".mist-2", { x: moveX, y: moveY, duration: 2.2, overwrite: "auto", ease: "power2.out" });
            gsap.to(".glow-orb-center", { x: moveX * 0.5, y: moveY * 0.5, duration: 1.8, overwrite: "auto", ease: "power2.out" });
            pointerFrame = null;
        });
    });
}

// Lock scroll on initial load
document.body.classList.add('no-scroll');

// ----------------------------------------
// 2. THE 7-NODE TRACKING ENGINE
// ----------------------------------------

function initJourney() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && typeof gsap.registerPlugin === 'function') {
        gsap.registerPlugin(ScrollTrigger);
    }

    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }

    const particleContainer = document.getElementById('particle-container');
    if (particleContainer) {
        particleContainer.innerHTML = '';
    }

    // Generate Floating Water Spores (Sương Nước Li Ti)
    createParticles();

    gsap.set(".underwater-veil", { autoAlpha: 0, yPercent: 12 });
    gsap.set(".horizon-group", { yPercent: 8 });
    gsap.set(".waterline-glow", { autoAlpha: 0.72, scaleX: 0.92 });
    gsap.set(".surface-content", { autoAlpha: 0, scale: 0.98, filter: "blur(1px)" });
    gsap.set(".mound-wrap, .tall-plant-cluster, .p-far, .p-mid, .p-near", { autoAlpha: 0, yPercent: 18 });
    gsap.set("#door-left, #door-right", { autoAlpha: 0 });
    gsap.set(".stars-container", { autoAlpha: 1 });

    // Reveal Node 1 Text (RE-WILD Restoration)
    gsap.from(".title-reveal", { 
        y: 80, 
        opacity: 0, 
        duration: 2.5, 
        ease: "expo.out",
        delay: 0.5 
    });

    // Main 2D Canvas Timeline
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".camera-wrapper",
            start: "top top",
            scrub: 1.5, // Smooth lagging camera feel
            end: "+=9500" // Expanded scroll block
        }
    });
    setupNodeActionButtons();

    // ----------------------------------------------------
    // PHASE 1: THE SURFACE (Translating X)
    // ----------------------------------------------------
    
    // Node 1 (Start) -> Node 2 (Welcome)
    tl.to("#world-canvas", { x: "-100vw", duration: 3, ease: "power1.inOut" })
    
    // Node 2 (Welcome) -> Node 3 (Our Principles)
      .to("#world-canvas", { x: "-200vw", duration: 4, ease: "power1.inOut" })
      // ADDING PARALLAX TO LAYERS AT NODE 3
      .to(".layer-far", { x: "15vw", duration: 4, ease: "none" }, "<")
      .to(".layer-mid", { x: "-10vw", duration: 4, ease: "none" }, "<")
      .to(".layer-near", { x: "-30vw", duration: 4, ease: "none" }, "<")
      
    // Node 3 (Principles) -> Node 4 (How It Works)
      .to("#world-canvas", { x: "-300vw", duration: 4, ease: "power1.inOut" })
      
    // ----------------------------------------------------
    // PHASE 2 & 3: THE VERTICAL DROP (Pull Down to Pond)
    // ----------------------------------------------------
      
      .add("drop-start")
      
    // Node 4 (How) -> Node 5 (Why Now? Surface) -- VERTICAL MOVE (Extra spacing)
      .to("#world-canvas", { y: "-250vh", duration: 7, ease: "power2.inOut" })
      .to(".mound-wrap", { autoAlpha: 1, yPercent: 0, duration: 3.8, ease: "power2.out" }, "drop-start+=1.2")
      .to(".tall-plant-cluster", { autoAlpha: 1, yPercent: 0, duration: 3.4, ease: "power2.out" }, "drop-start+=1.5")
      .to(".p-far", { autoAlpha: 0.65, yPercent: 0, duration: 3.8, stagger: 0.05, ease: "power2.out" }, "drop-start+=2.1")
      .to(".p-mid", { autoAlpha: 0.9, yPercent: 0, duration: 3.8, stagger: 0.05, ease: "power2.out" }, "drop-start+=2.4")
      .to(".p-near", { autoAlpha: 0.82, yPercent: 0, duration: 3.8, stagger: 0.05, ease: "power2.out" }, "drop-start+=2.8")
      .to(".horizon-group", { yPercent: 0, duration: 4.2, ease: "power2.out" }, "drop-start+=1.8")
      .to(".surface-content", { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 2.8, ease: "power2.out" }, "drop-start+=3.2")
      
      .add("surface-ready")
      
    // 1. TILTING THE SURFACE (Cinematic looking down)
      .to(".surface-scene-wrap", { rotationX: -4, scale: 1.01, duration: 3, ease: "sine.inOut" })
      .to(".horizon-group", { y: "0.2vh", duration: 3, ease: "sine.out" }, "surface-ready")
      .to(".waterline-glow", { scaleX: 1, duration: 3, ease: "sine.out" }, "surface-ready")
      .to(".p-far", { yPercent: -4, duration: 3, stagger: 0.04, ease: "none" }, "surface-ready")
      .to(".p-mid", { yPercent: -5, duration: 3, stagger: 0.04, ease: "none" }, "surface-ready")
      
      .add("dive") // The Submerge Point
      
    // Keep the lake scene readable first, then let the title drift upward as we dive.
      .to(".horizon-group", { y: "-1.5vh", duration: 6, ease: "power1.inOut" }, "dive")
      .to(".surface-content", { scale: 0.92, opacity: 0.72, filter: "blur(0.5px)", duration: 6, ease: "power1.inOut" }, "dive")
      .to(".stars-container", { opacity: 0.28, duration: 5, ease: "sine.out" }, "dive")
      .to(".waterline-glow", { opacity: 0.34, duration: 6, ease: "power1.inOut" }, "dive")
      .to(".underwater-veil", { opacity: 1, yPercent: 0, duration: 6, ease: "sine.inOut" }, "dive")
      .to(".p-near", { yPercent: 18, scale: 1.36, duration: 6, stagger: 0.05, ease: "power1.in" }, "dive")
      
    // Simultaneously drop the camera down into the lake (Node 6)
      .to("#world-canvas", { x: "-300vw", y: "-370vh", duration: 8, ease: "power2.inOut" }, "dive")
      
    // Node 6 -> Node 7 (Deeper)
      .to("#world-canvas", { x: "-300vw", y: "-470vh", duration: 5, ease: "none" })
      
    // Node 7 -> Node 8 (Bottom)
      .to("#world-canvas", { x: "-300vw", y: "-570vh", duration: 5, ease: "none" })
      
    // Node 8 -> Node 9 (Footer / Lakebed)
      .to("#world-canvas", { x: "-300vw", y: "-670vh", duration: 6, ease: "power2.out" });

    // ----------------------------------------
    // AUDIO ZONE ENGINE (Scroll-based Crossfade)
    // ----------------------------------------
    const lakeAudio  = document.getElementById('ambient-audio');
    const diveAudio  = document.getElementById('dive-audio');
    const underAudio = document.getElementById('under-audio');
    const allAudio   = [lakeAudio, diveAudio, underAudio];
    const fadeTimers = new WeakMap();
    let currentZone  = null;

    // Đọc flag từ btnEnter đã click trước khi initJourney chạy
    const audioStarted = () => !!window._audioZoneStarted;

    // Fade volume dùng vanilla JS (GSAP tween audio element thường bị bug)
    function fadeAudio(target, toVol, dur = 1200) {
        allAudio.forEach(a => {
            if (!a) return;
            const activeTimer = fadeTimers.get(a);
            if (activeTimer) {
                clearInterval(activeTimer);
                fadeTimers.delete(a);
            }

            const isTarget = (a === target);
            const startVol = a.volume;
            const endVol   = isTarget ? toVol : 0;
            if (Math.abs(startVol - endVol) < 0.01) return; // Không cần fade nếu đã đúng

            if (isTarget && a.paused) {
                a.currentTime = a.currentTime || 0;
                a.play().catch(() => {});
            }

            const steps = 30;
            const stepTime = dur / steps;
            const stepVol  = (endVol - startVol) / steps;
            let step = 0;

            const timer = setInterval(() => {
                step++;
                a.volume = Math.min(1, Math.max(0, startVol + stepVol * step));
                if (step >= steps) {
                    clearInterval(timer);
                    fadeTimers.delete(a);
                    a.volume = endVol;
                    if (!isTarget && a.volume < 0.02) a.pause();
                }
            }, stepTime);

            fadeTimers.set(a, timer);
        });
    }

    function setAudioZone(zone) {
        if (!audioStarted() || zone === currentZone) return;
        currentZone = zone;
        if (zone === 'surface')    fadeAudio(lakeAudio, 0.5);
        else if (zone === 'dive')  fadeAudio(diveAudio, 0.6);
        else if (zone === 'under') fadeAudio(underAudio, 0.5);
    }


    // LAYER THEME & COLOR DEPTH RESPONSES
    ScrollTrigger.create({
        trigger: ".camera-wrapper",
        start: "top top",
        end: "+=9000",
        scrub: 1,
        onUpdate: (self) => {
            let p = self.progress;

            // Audio zone switching
            if (p > 0.55) {
                setAudioZone('under'); // Node 6+ : dưới mặt nước
            } else if (p > 0.40) {
                setAudioZone('dive');  // Node 5 "dive" : chuyển tiếp
            } else {
                setAudioZone('surface'); // Node 1-4 : trên mặt hồ
            }

            // Background depth color mapping
            if (p > 0.8) {
                gsap.to(".bg-gradient-fixed", { backgroundColor: "var(--bg-layer3)", duration: 1.5 });
                gsap.to("#particle-container", { opacity: 0.1, duration: 1 });
            } else if (p > 0.6) {
                gsap.to(".bg-gradient-fixed", { backgroundColor: "var(--bg-layer2)", duration: 1.5 });
                gsap.to("#particle-container", { opacity: 0.5, duration: 1 });
            } else if (p > 0.3) {
                gsap.set(".p-far, .p-mid, .p-near", { autoAlpha: 1 });
                gsap.to(".bg-gradient-fixed", { backgroundColor: "var(--bg-layer1)", duration: 1.5 });
                gsap.to("#particle-container", { opacity: 1, duration: 1 });
            } else {
                gsap.to(".bg-gradient-fixed", { backgroundColor: "var(--bg-surface)", duration: 1.5 });
                gsap.to("#particle-container", { opacity: 0, duration: 0.5 });
            }
        }
    });

    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }

    // Fish idle animation (Bơi lên xuống nhịp nhàng)
    gsap.utils.toArray('.fish-anim').forEach(fish => {
        gsap.to(fish, {
            y: "-40px",
            rotation: 2,
            duration: 2.5 + Math.random(),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    });

    // Global Scroll Progress Bar
    gsap.to(".scroll-status-bar", {
        height: "100%",
        ease: "none",
        scrollTrigger: {
            trigger: ".camera-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: true
        }
    });
}

// ----------------------------------------
    // STEP 2: SURFACE BREAK (Why Now?)
    // This creates the 'Parting Sea' effect for the lily pads
    gsap.to(".pad-left", {
        x: -400,
        opacity: 0,
        scrollTrigger: {
            trigger: ".camera-wrapper",
            start: "800px top",
            end: "1500px top",
            scrub: true,
        }
    });
    gsap.to(".pad-right", {
        x: 400,
        opacity: 0,
        scrollTrigger: {
            trigger: ".camera-wrapper",
            start: "800px top",
            end: "1500px top",
            scrub: true,
        }
    });

    // STEP 3: UNDERWATER TRANSITION
// ----------------------------------------
// 3. UNDERWATER PARTICLE ENGINE (Spores & Bubbles)
// ----------------------------------------
function createParticles() {
    const particleContainer = document.getElementById('particle-container');
    if (!particleContainer) return;
    const particleCount = prefersReducedMotion ? 16 : (isSmallViewport ? 32 : 80);
    
    // Scale particle density down on constrained devices.
    for (let i = 0; i < particleCount; i++) {
        let p = document.createElement('div');
        const isBubble = Math.random() > 0.6;
        
        p.className = isBubble ? 'particle p-bubble' : 'particle p-spore';
        
        // Randomize spawn coordinates
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        
        // Randomize size
        const size = isBubble ? (Math.random() * 8 + 4) : (Math.random() * 4 + 2);
        p.style.width = size + "px";
        p.style.height = size + "px";
        p.style.opacity = "0"; // Start hidden
        
        particleContainer.appendChild(p);

        // Movement Logic
        gsap.to(p, {
            y: "-400vh", // Stream upwards
            opacity: isBubble ? 0.4 : 0.8,
            ease: "none",
            scrollTrigger: {
                trigger: ".camera-wrapper",
                start: "1500px top", // Only start visible after some scrolling
                end: "bottom bottom",
                scrub: Math.random() * 2 + 0.5
            }
        });
    }

    // Container Fade in when Diving
    gsap.to(particleContainer, {
        opacity: 1,
        scrollTrigger: {
            trigger: ".camera-wrapper",
            start: "3500px top", // Trigger near the 'Why Now' dive point
            end: "4500px top",
            scrub: true
        }
    });
}

// ----------------------------------------
// 4. CINEMATIC MENU REVEAL (GSAP + BOOTSTRAP)
// ----------------------------------------
const offcanvasEl = document.getElementById('offcanvasAbout');
if (offcanvasEl) {
    offcanvasEl.addEventListener('show.bs.offcanvas', () => {
        // Reset states
        gsap.set(".nav-link", { x: 50, opacity: 0 });
        gsap.set(".divider-gold", { width: 0 });
        gsap.set(".mission-snapshot", { y: 20, opacity: 0 });
        gsap.set(".offcanvas-footer", { opacity: 0 });

        // Stagger Reveal Timeline
        const menuTl = gsap.timeline({ delay: 0.2 });
        menuTl.to(".nav-link", { x: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out" })
              .to(".divider-gold", { width: 50, duration: 0.5 }, "-=0.4")
              .to(".mission-snapshot", { y: 0, opacity: 1, duration: 0.6 }, "-=0.3")
              .to(".offcanvas-footer", { opacity: 1, duration: 0.5 }, "-=0.2");
    });
}
