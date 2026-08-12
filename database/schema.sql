-- Database: sistem_absensi_honor

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(200) NOT NULL,
    role ENUM('admin', 'wakasek', 'bendahara', 'guru') DEFAULT 'guru',
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guru (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    nip VARCHAR(50),
    nomor_rekening VARCHAR(50),
    nama_bank VARCHAR(100),
    atas_nama_rekening VARCHAR(200),
    no_hp VARCHAR(20),
    alamat TEXT,
    tanggal_lahir DATE,
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mata_pelajaran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_mapel VARCHAR(50) UNIQUE NOT NULL,
    nama_mapel VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kelas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_kelas VARCHAR(50) UNIQUE NOT NULL,
    nama_kelas VARCHAR(100) NOT NULL,
    tingkat INT,
    jumlah_siswa INT DEFAULT 0,
    ruangan VARCHAR(100),
    qr_code_content VARCHAR(255),
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jadwal_pelajaran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guru_id INT NOT NULL,
    kelas_id INT NOT NULL,
    mata_pelajaran_id INT NOT NULL,
    hari VARCHAR(20) NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    durasi_menit INT,
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guru_id) REFERENCES guru(id),
    FOREIGN KEY (kelas_id) REFERENCES kelas(id),
    FOREIGN KEY (mata_pelajaran_id) REFERENCES mata_pelajaran(id),
    INDEX idx_guru (guru_id),
    INDEX idx_kelas (kelas_id),
    INDEX idx_hari (hari)
);

CREATE TABLE IF NOT EXISTS absensi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guru_id INT NOT NULL,
    jadwal_pelajaran_id INT NOT NULL,
    kelas_id INT NOT NULL,
    tanggal DATE NOT NULL,
    hari VARCHAR(20),
    waktu_mulai_jadwal TIME,
    waktu_selesai_jadwal TIME,
    waktu_scan DATETIME,
    status ENUM('hadir', 'terlambat', 'sakit', 'izin', 'alpa') DEFAULT 'hadir',
    keterangan TEXT,
    scan_by_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guru_id) REFERENCES guru(id),
    FOREIGN KEY (jadwal_pelajaran_id) REFERENCES jadwal_pelajaran(id),
    FOREIGN KEY (kelas_id) REFERENCES kelas(id),
    FOREIGN KEY (scan_by_user_id) REFERENCES users(id),
    INDEX idx_guru_tanggal (guru_id, tanggal),
    UNIQUE KEY unique_absensi (guru_id, jadwal_pelajaran_id, tanggal)
);

CREATE TABLE IF NOT EXISTS pengaturan_honor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipe_tarif ENUM('per_jam', 'per_pertemuan') DEFAULT 'per_jam',
    tarif_dasar DECIMAL(10, 2) NOT NULL,
    tarif_terlambat DECIMAL(10, 2) DEFAULT 0,
    tarif_sakit DECIMAL(10, 2) DEFAULT 0,
    tarif_izin DECIMAL(10, 2) DEFAULT 0,
    periode_berlaku_mulai DATE NOT NULL,
    periode_berlaku_sampai DATE,
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert demo users
INSERT INTO users (username, password, email, nama_lengkap, role, status) VALUES
('admin', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWDeBlkxiNyNyWFm', 'admin@sekolah.com', 'Administrator', 'admin', 'aktif'),
('wakasek', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWDeBlkxiNyNyWFm', 'wakasek@sekolah.com', 'Wakil Kepala Sekolah', 'wakasek', 'aktif'),
('bendahara', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWDeBlkxiNyNyWFm', 'bendahara@sekolah.com', 'Bendahara Sekolah', 'bendahara', 'aktif'),
('guru1', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWDeBlkxiNyNyWFm', 'guru1@sekolah.com', 'Guru Matematika', 'guru', 'aktif');

-- Insert demo mata pelajaran
INSERT INTO mata_pelajaran (kode_mapel, nama_mapel, deskripsi) VALUES
('MTK', 'Matematika', 'Pelajaran Matematika'),
('IPA', 'IPA', 'Ilmu Pengetahuan Alam'),
('IPS', 'IPS', 'Ilmu Pengetahuan Sosial'),
('BIN', 'Bahasa Indonesia', 'Bahasa Indonesia'),
('BIG', 'Bahasa Inggris', 'Bahasa Inggris');

-- Insert demo kelas
INSERT INTO kelas (kode_kelas, nama_kelas, tingkat, jumlah_siswa, ruangan, qr_code_content) VALUES
('7A', 'Kelas 7A', 7, 32, 'Ruang 101', 'KELAS_7A'),
('7B', 'Kelas 7B', 7, 30, 'Ruang 102', 'KELAS_7B'),
('8A', 'Kelas 8A', 8, 31, 'Ruang 201', 'KELAS_8A'),
('9A', 'Kelas 9A', 9, 28, 'Ruang 301', 'KELAS_9A');

-- Insert demo guru
INSERT INTO guru (user_id, nip, nomor_rekening, nama_bank, atas_nama_rekening, no_hp, alamat, tanggal_lahir) VALUES
(4, '123456789', '1234567890', 'BCA', 'Guru Satu', '081234567890', 'Jl. Pendidikan No. 1', '1985-05-15');

-- Insert demo jadwal
INSERT INTO jadwal_pelajaran (guru_id, kelas_id, mata_pelajaran_id, hari, jam_mulai, jam_selesai, durasi_menit) VALUES
(1, 1, 1, 'Senin', '07:00:00', '08:30:00', 90),
(1, 2, 1, 'Senin', '08:30:00', '10:00:00', 90),
(1, 3, 1, 'Selasa', '07:00:00', '08:30:00', 90),
(1, 4, 1, 'Rabu', '07:00:00', '08:30:00', 90);

-- Insert demo pengaturan honor
INSERT INTO pengaturan_honor (tipe_tarif, tarif_dasar, tarif_terlambat, tarif_sakit, tarif_izin, periode_berlaku_mulai) VALUES
('per_jam', 100000, 50000, 75000, 75000, '2026-01-01');
