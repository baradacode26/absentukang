// Konstanta Harga
const HARGA_TUKANG = 220000;
const HARGA_KENEK = 150000;

// Data penyimpanan
let dataAbsensi = [];
let saldoTersedia = 0;

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Set tanggal input ke hari ini
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tanggal').value = today;
    
    // Load data dari localStorage
    loadData();
    
    // Update perhitungan ketika input berubah
    document.getElementById('jumlahTukang').addEventListener('input', updateSummary);
    document.getElementById('jumlahKenek').addEventListener('input', updateSummary);
});

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
    saveData();
    updateSaldoDisplay();
    inputElement.value = '';
    
    showNotification('Saldo berhasil ditambahkan Rp ' + formatRupiah(jumlah).replace('Rp ', ''), 'success');
}

// Update tampilan saldo
function updateSaldoDisplay() {
    const totalPengeluaran = dataAbsensi.reduce((sum, item) => sum + item.totalBiaya, 0);
    const sisaSaldo = saldoTersedia - totalPengeluaran;
    
    document.getElementById('saldoTersedia').textContent = formatRupiah(saldoTersedia);
    document.getElementById('totalPengeluaran').textContent = formatRupiah(totalPengeluaran);
    document.getElementById('sisaSaldo').textContent = formatRupiah(sisaSaldo);
    
    // Ubah warna sisa saldo berdasarkan kondisi
    const sisaSaldoElement = document.getElementById('sisaSaldo');
    if (sisaSaldo < 0) {
        sisaSaldoElement.style.color = '#dc2626'; // Merah jika minus
    } else if (sisaSaldo === 0) {
        sisaSaldoElement.style.color = '#f59e0b'; // Orange jika pas
    } else {
        sisaSaldoElement.style.color = '#2563eb'; // Biru jika positif
    }
}

// Tambah data absensi
function tambahData() {
    const tanggal = document.getElementById('tanggal').value;
    const jumlahTukang = parseInt(document.getElementById('jumlahTukang').value) || 0;
    const jumlahKenek = parseInt(document.getElementById('jumlahKenek').value) || 0;
    
    // Validasi input
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
    
    // Cek saldo cukup
    const totalPengeluaranSekarang = dataAbsensi.reduce((sum, item) => sum + item.totalBiaya, 0);
    if (saldoTersedia < totalPengeluaranSekarang + totalBiaya) {
        alert('Saldo tidak cukup!\nSaldo tersedia: ' + formatRupiah(saldoTersedia) + '\nKebutuhan: ' + formatRupiah(totalPengeluaranSekarang + totalBiaya));
        return;
    }
    
    // Cek apakah tanggal sudah ada
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
    
    // Urutkan berdasarkan tanggal
    dataAbsensi.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    
    // Simpan ke localStorage
    saveData();
    
    // Update tampilan
    tampilkanTabel();
    updateSaldoDisplay();
    resetForm();
    
    // Tampilkan notifikasi
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
        saveData();
        tampilkanTabel();
        updateSaldoDisplay();
        showNotification('Data berhasil dihapus', 'info');
    }
}

// Hapus semua data
function hapusSemua() {
    if (confirm('Yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan.')) {
        dataAbsensi = [];
        saveData();
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
    
    // Hitung total
    const totalTukang = dataAbsensi.reduce((sum, item) => sum + item.biayaTukang, 0);
    const totalKenek = dataAbsensi.reduce((sum, item) => sum + item.biayaKenek, 0);
    const grandTotal = dataAbsensi.reduce((sum, item) => sum + item.totalBiaya, 0);
    const sisaSaldo = saldoTersedia - grandTotal;
    
    csv += '\n,Total:,,,' + totalTukang + ',' + totalKenek + ',' + grandTotal + '\n';
    csv += '\n,Sisa Saldo:' + sisaSaldo + '\n';
    
    // Download
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

// Simpan data ke localStorage
function saveData() {
    localStorage.setItem('dataAbsensi', JSON.stringify(dataAbsensi));
    localStorage.setItem('saldoTersedia', saldoTersedia);
}

// Load data dari localStorage
function loadData() {
    const saved = localStorage.getItem('dataAbsensi');
    const saldo = localStorage.getItem('saldoTersedia');
    
    if (saved) {
        dataAbsensi = JSON.parse(saved);
        tampilkanTabel();
    }
    
    if (saldo) {
        saldoTersedia = parseInt(saldo);
    }
    
    updateSaldoDisplay();
}

// Tampilkan notifikasi
function showNotification(message, type) {
    // Buat elemen notifikasi
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
    
    // Hapus setelah 3 detik
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