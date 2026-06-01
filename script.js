// Konstanta Harga
const HARGA_TUKANG = 220000;
const HARGA_KENEK = 150000;

// GitHub Raw Content URL (Public Access - Tidak perlu Token)
const REPO_OWNER = 'ahmaddzulkifli86-ai';
const REPO_NAME = 'absentukang';
const BRANCH = 'main';
const RAW_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`;
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`;

const DATA_FILE = 'data.json';
const SALDO_FILE = 'saldo.json';
const CONFIG_FILE = 'config.json';

// Data penyimpanan
let dataAbsensi = [];
let saldoTersedia = 0;
let lastSyncTime = null;
let githubToken = null;

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Set tanggal input ke hari ini
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tanggal').value = today;
    
    // Setup token sekali saja di perangkat pertama
    setupGitHubToken();
    
    // Load data dari cloud
    loadDataFromCloud();
    
    // Update perhitungan ketika input berubah
    document.getElementById('jumlahTukang').addEventListener('input', updateSummary);
    document.getElementById('jumlahKenek').addEventListener('input', updateSummary);
    
    // Auto sync setiap 5 detik
    setInterval(syncDataFromCloud, 5000);
});

// Setup GitHub Token - Hanya di Perangkat Pertama
function setupGitHubToken() {
    // Cek apakah token sudah ada di localStorage
    const storedToken = localStorage.getItem('githubToken');
    
    if (storedToken) {
        githubToken = storedToken;
        console.log('✓ Token sudah tersedia, menggunakan token yang ada');
        return;
    }
    
    // Cek di sessionStorage (untuk user yang baru pertama kali)
    const sessionToken = sessionStorage.getItem('githubToken');
    if (sessionToken) {
        githubToken = sessionToken;
        localStorage.setItem('githubToken', sessionToken);
        console.log('✓ Token dari session, disimpan ke localStorage');
        return;
    }
    
    // Minta token hanya jika belum ada
    const userToken = prompt(
        'SETUP APLIKASI (Hanya sekali)\n\n' +
        'Masukkan GitHub Personal Access Token:\n\n' +
        '📖 Cara membuat token:\n' +
        '1. Buka: https://github.com/settings/tokens\n' +
        '2. Klik "Generate new token (classic)"\n' +
        '3. Beri nama: absentukang-app\n' +
        '4. Pilih scope: repo (full control)\n' +
        '5. Generate & copy token\n\n' +
        'Catatan: Token hanya perlu diinput sekali. Perangkat lain akan otomatis terhubung.'
    );
    
    if (userToken && userToken.trim().length > 0) {
        githubToken = userToken.trim();
        localStorage.setItem('githubToken', githubToken);
        sessionStorage.setItem('githubToken', githubToken);
        showNotification('Token tersimpan! Aplikasi siap digunakan.', 'success');
    } else {
        showNotification('Token tidak diisi. Aplikasi bekerja dengan mode lokal.', 'warning');
    }
}

// Load data dari Cloud (GitHub)
async function loadDataFromCloud() {
    try {
        if (!githubToken) {
            console.log('⚠️ Token belum ada, loading dari lokal');
            loadDataFromLocal();
            return;
        }
        
        console.log('📥 Loading dari cloud...');
        
        // Load absensi data
        const absensiResponse = await fetch(
            `${API_URL}/${DATA_FILE}`,
            {
                headers: { 'Authorization': `token ${githubToken}` }
            }
        );
        
        if (absensiResponse.ok) {
            const absensiData = await absensiResponse.json();
            const decodedContent = atob(absensiData.content);
            const parsedData = JSON.parse(decodedContent);
            dataAbsensi = parsedData.data || [];
            console.log('✓ Data absensi berhasil dimuat:', dataAbsensi.length, 'baris');
        } else {
            console.log('⚠️ File data.json belum ada di cloud, membuat baru...');
            dataAbsensi = [];
        }
        
        // Load saldo data
        const saldoResponse = await fetch(
            `${API_URL}/${SALDO_FILE}`,
            {
                headers: { 'Authorization': `token ${githubToken}` }
            }
        );
        
        if (saldoResponse.ok) {
            const saldoData = await saldoResponse.json();
            const decodedContent = atob(saldoData.content);
            const parsedData = JSON.parse(decodedContent);
            saldoTersedia = parsedData.saldo || 0;
            console.log('✓ Data saldo berhasil dimuat:', formatRupiah(saldoTersedia));
        } else {
            console.log('⚠️ File saldo.json belum ada di cloud, membuat baru...');
            saldoTersedia = 0;
        }
        
        tampilkanTabel();
        updateSaldoDisplay();
        updateSyncStatus();
    } catch (error) {
        console.error('❌ Error loading cloud:', error.message);
        loadDataFromLocal();
    }
}

// Sync data dari cloud
async function syncDataFromCloud() {
    try {
        if (!githubToken) return;
        
        // Cek data absensi di cloud
        const absensiResponse = await fetch(
            `${API_URL}/${DATA_FILE}`,
            {
                headers: { 'Authorization': `token ${githubToken}` }
            }
        );
        
        if (absensiResponse.ok) {
            const absensiData = await absensiResponse.json();
            const decodedContent = atob(absensiData.content);
            const parsedData = JSON.parse(decodedContent);
            const cloudData = parsedData.data || [];
            
            // Cek jika ada perubahan di cloud
            if (JSON.stringify(cloudData) !== JSON.stringify(dataAbsensi)) {
                console.log('🔄 Update data terdeteksi, mengupdate tampilan...');
                dataAbsensi = cloudData;
                tampilkanTabel();
            }
        }
        
        // Cek data saldo di cloud
        const saldoResponse = await fetch(
            `${API_URL}/${SALDO_FILE}`,
            {
                headers: { 'Authorization': `token ${githubToken}` }
            }
        );
        
        if (saldoResponse.ok) {
            const saldoData = await saldoResponse.json();
            const decodedContent = atob(saldoData.content);
            const parsedData = JSON.parse(decodedContent);
            const cloudSaldo = parsedData.saldo || 0;
            
            if (cloudSaldo !== saldoTersedia) {
                console.log('🔄 Update saldo terdeteksi');
                saldoTersedia = cloudSaldo;
                updateSaldoDisplay();
            }
        }
        
        updateSyncStatus();
    } catch (error) {
        console.log('⚠️ Sync error (akan retry):', error.message);
    }
}

// Simpan data ke Cloud (GitHub)
async function saveDataToCloud() {
    if (!githubToken) {
        console.log('⚠️ Token tidak ada, hanya simpan lokal');
        saveDataToLocal();
        return;
    }
    
    try {
        console.log('📤 Menyimpan ke cloud...');
        
        // Save absensi data
        await saveFileToGitHub(DATA_FILE, {
            data: dataAbsensi,
            lastUpdate: new Date().toISOString()
        });
        
        // Save saldo data
        await saveFileToGitHub(SALDO_FILE, {
            saldo: saldoTersedia,
            lastUpdate: new Date().toISOString()
        });
        
        updateSyncStatus();
        console.log('✓ Data berhasil disimpan ke cloud');
    } catch (error) {
        console.error('❌ Error saving to cloud:', error.message);
        saveDataToLocal();
    }
}

// Helper: Save file ke GitHub
async function saveFileToGitHub(filename, jsonContent) {
    const content = JSON.stringify(jsonContent, null, 2);
    
    // Get SHA untuk update
    const checkResponse = await fetch(
        `${API_URL}/${filename}`,
        {
            headers: { 'Authorization': `token ${githubToken}` }
        }
    );
    
    let sha = null;
    if (checkResponse.ok) {
        const fileData = await checkResponse.json();
        sha = fileData.sha;
    }
    
    // Upload file
    const response = await fetch(
        `${API_URL}/${filename}`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Update ${filename}`,
                content: btoa(content),
                sha: sha
            })
        }
    );
    
    if (!response.ok) {
        throw new Error(`Failed to save ${filename}: ${response.status}`);
    }
}

// Load data dari Local (Backup)
function loadDataFromLocal() {
    console.log('📂 Loading dari lokal...');
    const saved = localStorage.getItem('dataAbsensi');
    const saldo = localStorage.getItem('saldoTersedia');
    
    if (saved) {
        dataAbsensi = JSON.parse(saved);
        console.log('✓ Data absensi lokal dimuat');
    }
    
    if (saldo) {
        saldoTersedia = parseInt(saldo);
        console.log('✓ Data saldo lokal dimuat');
    }
    
    tampilkanTabel();
    updateSaldoDisplay();
}

// Simpan data lokal
function saveDataToLocal() {
    localStorage.setItem('dataAbsensi', JSON.stringify(dataAbsensi));
    localStorage.setItem('saldoTersedia', saldoTersedia);
    console.log('✓ Data disimpan lokal');
}

// Update tampilan sync status
function updateSyncStatus() {
    lastSyncTime = new Date();
    const timeString = lastSyncTime.toLocaleTimeString('id-ID');
    document.getElementById('lastSync').textContent = `⏱️ Terakhir: ${timeString}`;
    document.getElementById('syncStatus').textContent = '🟢 Sinkron';
}

// Update ringkasan perhitungan
function updateSummary() {
    const jumlahTukang = parseInt(document.getElementById('jumlahTukang').value) || 0;
    const jumlahKenek = parseInt(document.getElementById('jumlahKenek').value) || 0;
    
    const biayaTukang = jumlahTukang * HARGA_TUKANG;
    const biayaKenek = jumlahKenek * HARGA_KENEK;
    const totalBiaya = biayaTukang + biayaKenek;
    
    document.getElementById('biayaTukang').textContent = formatRupiah(biayaTukang);
    document.getElementById('biayaKenek').textContent = formatRupiah(biayaKenek);
    document.getElementById('totalBiaya').textContent = formatRupiah(totalBiaya);
}

// Format angka ke Rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(angka);
}

// Tambah saldo
function tambahSaldo() {
    const inputElement = document.getElementById('tambahSaldoInput');
    const jumlah = parseInt(inputElement.value) || 0;
    
    if (jumlah <= 0) {
        alert('Mohon masukkan jumlah saldo yang valid');
        return;
    }
    
    saldoTersedia += jumlah;
    saveDataToLocal();
    saveDataToCloud();
    updateSaldoDisplay();
    inputElement.value = '';
    
    showNotification('Saldo berhasil ditambahkan', 'success');
}

// Update tampilan saldo
function updateSaldoDisplay() {
    const totalPengeluaran = dataAbsensi.reduce((sum, item) => sum + item.totalBiaya, 0);
    const sisaSaldo = saldoTersedia - totalPengeluaran;
    
    document.getElementById('saldoTersedia').textContent = formatRupiah(saldoTersedia);
    document.getElementById('totalPengeluaran').textContent = formatRupiah(totalPengeluaran);
    document.getElementById('sisaSaldo').textContent = formatRupiah(sisaSaldo);
    
    const sisaSaldoElement = document.getElementById('sisaSaldo');
    if (sisaSaldo < 0) {
        sisaSaldoElement.style.color = '#dc2626';
    } else if (sisaSaldo === 0) {
        sisaSaldoElement.style.color = '#f59e0b';
    } else {
        sisaSaldoElement.style.color = '#2563eb';
    }
}

// Tambah data absensi
function tambahData() {
    const tanggal = document.getElementById('tanggal').value;
    const jumlahTukang = parseInt(document.getElementById('jumlahTukang').value) || 0;
    const jumlahKenek = parseInt(document.getElementById('jumlahKenek').value) || 0;
    
    if (!tanggal) {
        alert('Mohon pilih tanggal');
        return;
    }
    
    if (jumlahTukang === 0 && jumlahKenek === 0) {
        alert('Mohon masukkan jumlah tukang atau kenek');
        return;
    }
    
    const biayaTukang = jumlahTukang * HARGA_TUKANG;
    const biayaKenek = jumlahKenek * HARGA_KENEK;
    const totalBiaya = biayaTukang + biayaKenek;
    
    const totalPengeluaranSekarang = dataAbsensi.reduce((sum, item) => sum + item.totalBiaya, 0);
    if (saldoTersedia < totalPengeluaranSekarang + totalBiaya) {
        alert('Saldo tidak cukup!\nSaldo tersedia: ' + formatRupiah(saldoTersedia) + '\nKebutuhan: ' + formatRupiah(totalPengeluaranSekarang + totalBiaya));
        return;
    }
    
    const indexExist = dataAbsensi.findIndex(item => item.tanggal === tanggal);
    
    if (indexExist !== -1) {
        if (confirm('Tanggal ' + tanggal + ' sudah ada. Ingin ganti data?')) {
            dataAbsensi[indexExist] = {
                tanggal,
                jumlahTukang,
                jumlahKenek,
                biayaTukang,
                biayaKenek,
                totalBiaya
            };
        } else {
            return;
        }
    } else {
        dataAbsensi.push({
            tanggal,
            jumlahTukang,
            jumlahKenek,
            biayaTukang,
            biayaKenek,
            totalBiaya
        });
    }
    
    dataAbsensi.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    
    saveDataToLocal();
    saveDataToCloud();
    tampilkanTabel();
    updateSaldoDisplay();
    resetForm();
    
    showNotification('Data berhasil ditambahkan! Sisa saldo: ' + formatRupiah(saldoTersedia - dataAbsensi.reduce((sum, item) => sum + item.totalBiaya, 0)), 'success');
}

// Tampilkan tabel absensi
function tampilkanTabel() {
    const isiTabel = document.getElementById('isiTabel');
    const pesanKosong = document.getElementById('pesanKosong');
    
    if (dataAbsensi.length === 0) {
        isiTabel.innerHTML = '';
        pesanKosong.style.display = 'block';
        return;
    }
    
    pesanKosong.style.display = 'none';
    isiTabel.innerHTML = dataAbsensi.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${formatTanggal(item.tanggal)}</td>
            <td>${item.jumlahTukang}</td>
            <td>${item.jumlahKenek}</td>
            <td>${formatRupiah(item.biayaTukang)}</td>
            <td>${formatRupiah(item.biayaKenek)}</td>
            <td><strong>${formatRupiah(item.totalBiaya)}</strong></td>
            <td>
                <button class="btn-delete" onclick="hapusData(${index})">Hapus</button>
            </td>
        </tr>
    `).join('');
}

// Format tanggal
function formatTanggal(tanggal) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(tanggal + 'T00:00:00').toLocaleDateString('id-ID', options);
}

// Hapus data berdasarkan index
function hapusData(index) {
    if (confirm('Yakin ingin menghapus data ini?')) {
        dataAbsensi.splice(index, 1);
        saveDataToLocal();
        saveDataToCloud();
        tampilkanTabel();
        updateSaldoDisplay();
        showNotification('Data berhasil dihapus', 'info');
    }
}

// Hapus semua data
function hapusSemua() {
    if (confirm('Yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan.')) {
        dataAbsensi = [];
        saveDataToLocal();
        saveDataToCloud();
        tampilkanTabel();
        updateSaldoDisplay();
        resetForm();
        showNotification('Semua data berhasil dihapus', 'warning');
    }
}

// Reset form
function resetForm() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tanggal').value = today;
    document.getElementById('jumlahTukang').value = 0;
    document.getElementById('jumlahKenek').value = 0;
    updateSummary();
}

// Export ke CSV
function exportCSV() {
    if (dataAbsensi.length === 0) {
        alert('Tidak ada data untuk diekspor');
        return;
    }
    
    let csv = 'Sistem Absensi Tukang & Kenek\n';
    csv += 'Tanggal Export,' + new Date().toLocaleString('id-ID') + '\n';
    csv += 'Saldo Tersedia,' + saldoTersedia + '\n\n';
    csv += 'No,Tanggal,Tukang,Kenek,Biaya Tukang,Biaya Kenek,Total\n';
    
    dataAbsensi.forEach((item, index) => {
        csv += `${index + 1},"${item.tanggal}",${item.jumlahTukang},${item.jumlahKenek},${item.biayaTukang},${item.biayaKenek},${item.totalBiaya}\n`;
    });
    
    const totalTukang = dataAbsensi.reduce((sum, item) => sum + item.biayaTukang, 0);
    const totalKenek = dataAbsensi.reduce((sum, item) => sum + item.biayaKenek, 0);
    const grandTotal = dataAbsensi.reduce((sum, item) => sum + item.totalBiaya, 0);
    const sisaSaldo = saldoTersedia - grandTotal;
    
    csv += '\n,Total:,,,' + totalTukang + ',' + totalKenek + ',' + grandTotal + '\n';
    csv += '\n,Sisa Saldo:' + sisaSaldo + '\n';
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Absensi_Tukang_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('File berhasil didownload', 'success');
}

// Tampilkan notifikasi
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        font-weight: 600;
        max-width: 400px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Tambah animasi CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);