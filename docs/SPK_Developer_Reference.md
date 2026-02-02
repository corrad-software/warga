# Sistem Pengurusan Kewarganegaraan (SPK)
Version: 1.0  
Purpose: Developer Reference & AI Agent Context  

---

## 1. Pengenalan
Dokumen ini merupakan rujukan teknikal peringkat pembangun (developer-grade) bagi Sistem Pengurusan Kewarganegaraan (SPK). Ia direka untuk digunakan oleh:
- Pembangun perisian
- System Analyst / Solution Architect
- AI Coding Agent (VS Code / Cursor)

Dokumen ini **wajib dirujuk** sebelum pembangunan modul, API, workflow dan integrasi.

---

## 2. Objektif Sistem
- Mendigitalkan keseluruhan proses pengurusan kewarganegaraan
- Mengurangkan kebergantungan proses manual
- Meningkatkan ketepatan semakan melalui OCR & biometrik
- Menyediakan jejak audit penuh dan kebolehkesanan keputusan
- Menyokong operasi konsulat di luar negara

---

## 3. Skop Sistem
Sistem merangkumi:
- Pra pendaftaran pemohon
- Pengurusan dokumen sokongan
- Semakan automatik & manual
- Pengurusan biometrik
- Pembayaran
- Penjanaan sijil & nombor rujukan
- Pengurusan sumpah taat setia
- Pelaporan & audit

---

## 4. Peranan & Akses (RBAC)

### 4.1 Pemohon
- Daftar akaun
- Isi borang
- Muat naik dokumen
- Terima notifikasi
- Hadir fizikal ke konsulat

### 4.2 Pegawai Konsul
- Semak permohonan konsulat
- Ambil biometrik
- Sahkan dokumen asal
- Cetak & serah sijil

### 4.3 Pegawai Pendaftaran
- Semakan kelayakan
- Keputusan rasmi kewarganegaraan
- Pengurusan sumpah
- Pelaporan & audit

---

## 5. Seni Bina Sistem (Logical Architecture)

### 5.1 Core Services
- User Management Service
- Application Service
- Document Service
- OCR Service
- Biometric Service
- Payment Service
- Notification Service
- Audit & Logging Service
- Reporting Service
- Workflow Engine

---

## 6. Model Data Teras (High-Level Entities)

### 6.1 User
- id
- name
- role
- nationality_status
- biometric_status

### 6.2 Application
- application_id
- type
- status
- submission_date
- decision_date

### 6.3 Document
- document_id
- application_id
- file_path
- ocr_result
- verification_status

### 6.4 Biometric
- biometric_id
- user_id
- fingerprint_hash
- capture_date

### 6.5 Certificate
- certificate_no
- certificate_type
- issue_date
- qr_code

---

## 7. Modul Sistem

### 7.1 Modul Pra Pendaftaran
**Fungsi:**
- Pendaftaran akaun
- Borang pra permohonan
- Upload dokumen
- OCR & data matching
- Kelayakan awal

### 7.2 Modul Pengurusan Kewarganegaraan

#### 7.2.1 Kelahiran Luar Negara (Borang H)
- Biometrik pemohon
- Pembayaran
- Janaan sijil
- Tag sumpah masa depan

#### 7.2.2 Perkara 15(2) Fastlane (Borang G)
- Pengesahan bersama subjek
- Semakan berperingkat
- Notifikasi keputusan
- Serahan sijil

#### 7.2.3 Tadbir Sumpah
- Penjadualan sumpah
- Rekod sumpah
- Cetakan borang akuan

---

## 8. Workflow Engine (Ringkasan)

- Status-based transitions
- Role-based approval
- SLA tracking
- Auto-notification triggers

---

## 9. Integrasi Luaran
- Sistem Agensi Kerajaan
- Sistem Pembayaran
- Sistem Biometrik
- Sistem E-mel / SMS

---

## 10. Keselamatan & Pematuhan
- PDPA compliance
- Encryption at rest & transit
- Biometric data segregation
- Role-based access control
- Immutable audit log

---

## 11. Logging & Audit
- Semua tindakan direkod
- Audit trail tidak boleh dipadam
- Timestamp & actor mandatory

---

## 12. Non-Functional Requirements
- Availability: High Availability
- Response time < 10s
- Scalable (12,000+ permohonan / tahun)
- Secure & fault tolerant

---

## 13. Nota untuk AI Coding Agent
- Jangan hardcode status
- Semua flow mesti melalui workflow engine
- Semua perubahan mesti direkod dalam audit log
- Biometrik adalah mandatory untuk final approval

---

## 14. Penutup
Dokumen ini adalah **sumber kebenaran tunggal (Single Source of Truth)** bagi pembangunan SPK.  
Sebarang perubahan mesti melalui proses kawalan versi.
