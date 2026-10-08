/* =========================================================
   KONFIGURASI
========================================================= */

const CONFIG = {

    /*
     * Isi dengan konfigurasi EmailJS milik kamu.
     */
    EMAILJS_PUBLIC_KEY: "VOnAbNjMTEV2STlyr",

    EMAILJS_SERVICE_ID: "service_v4uxzfd",

    EMAILJS_TEMPLATE_ID: "template_v5ttydk"

};


/* =========================================================
   GLOBAL
========================================================= */

let karyawanData = [];

let selectedEmployee = null;


/* =========================================================
   ELEMENT
========================================================= */

const el = {

    karyawan:
        document.getElementById("karyawan"),

    nik:
        document.getElementById("nik"),

    jabatan:
        document.getElementById("jabatan"),

    departemen:
        document.getElementById("departemen"),

    jenisIzin:
        document.getElementById("jenisIzin"),

    customKeperluanGroup:
        document.getElementById(
            "customKeperluanGroup"
        ),

    customKeperluan:
        document.getElementById(
            "customKeperluan"
        ),

    tanggalMulai:
        document.getElementById(
            "tanggalMulai"
        ),

    tanggalSelesai:
        document.getElementById(
            "tanggalSelesai"
        ),

    keterangan:
        document.getElementById(
            "keterangan"
        ),

    emailTujuan:
        document.getElementById(
            "emailTujuan"
        ),

    previewNama:
        document.getElementById(
            "previewNama"
        ),

    previewNik:
        document.getElementById(
            "previewNik"
        ),

    previewJabatan:
        document.getElementById(
            "previewJabatan"
        ),

    previewDepartemen:
        document.getElementById(
            "previewDepartemen"
        ),

    previewKeperluan:
        document.getElementById(
            "previewKeperluan"
        ),

    previewTanggal:
        document.getElementById(
            "previewTanggal"
        ),

    previewKeterangan:
        document.getElementById(
            "previewKeterangan"
        ),

    previewSignature:
        document.getElementById(
            "previewSignature"
        ),

    previewNamaSignature:
        document.getElementById(
            "previewNamaSignature"
        ),

    previewJabatanSignature:
        document.getElementById(
            "previewJabatanSignature"
        ),

    previewTanggalSurat:
        document.getElementById(
            "previewTanggalSurat"
        ),

    tanggalHariIni:
        document.getElementById(
            "tanggalHariIni"
        ),

    surat:
        document.getElementById("surat"),

    loading:
        document.getElementById("loading")

};


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setTanggalHariIni();

        await loadKaryawan();

        initEmailJS();

        setupEvents();

        updatePreview();

    }
);


/* =========================================================
   LOAD JSON
========================================================= */

async function loadKaryawan() {

    try {

        const response =
            await fetch(
                "data/karyawan.json"
            );

        if (!response.ok) {

            throw new Error(
                "Gagal mengambil data karyawan."
            );

        }

        karyawanData =
            await response.json();

        renderKaryawan();

    } catch (error) {

        console.error(error);

        alert(
            "Data karyawan gagal dimuat.\n\n" +
            "Pastikan aplikasi dijalankan melalui server lokal."
        );

    }

}


/* =========================================================
   RENDER KARYAWAN
========================================================= */

function renderKaryawan() {

    el.karyawan.innerHTML = `
        <option value="">
            -- Pilih Karyawan --
        </option>
    `;

    karyawanData.forEach(
        employee => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                employee.id;

            option.textContent =
                employee.nama;

            el.karyawan.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   EMAILJS
========================================================= */

function initEmailJS() {

    if (
        !CONFIG.EMAILJS_PUBLIC_KEY ||
        CONFIG.EMAILJS_PUBLIC_KEY ===
        "GANTI_PUBLIC_KEY"
    ) {

        console.warn(
            "EmailJS belum dikonfigurasi."
        );

        return;

    }

    emailjs.init({

        publicKey:
            CONFIG.EMAILJS_PUBLIC_KEY

    });

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    el.karyawan.addEventListener(
        "change",
        handleEmployeeChange
    );


    el.jenisIzin.addEventListener(
        "change",
        () => {

            if (
                el.jenisIzin.value ===
                "Lainnya"
            ) {

                el.customKeperluanGroup
                    .classList
                    .remove("hidden");

            } else {

                el.customKeperluanGroup
                    .classList
                    .add("hidden");

                el.customKeperluan.value =
                    "";

            }

            updatePreview();

        }
    );


    [
        el.customKeperluan,
        el.tanggalMulai,
        el.tanggalSelesai,
        el.keterangan,
        el.emailTujuan
    ].forEach(
        element => {

            element.addEventListener(
                "input",
                updatePreview
            );

            element.addEventListener(
                "change",
                updatePreview
            );

        }
    );


    document
        .getElementById("btnPreview")
        .addEventListener(
            "click",
            () => {

                updatePreview();

                el.surat.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );


    document
        .getElementById("btnPDF")
        .addEventListener(
            "click",
            downloadPDF
        );


    document
        .getElementById("btnEmail")
        .addEventListener(
            "click",
            sendEmail
        );

}


/* =========================================================
   KARYAWAN CHANGE
========================================================= */

function handleEmployeeChange() {

    const id =
        el.karyawan.value;

    selectedEmployee =
        karyawanData.find(
            employee =>
                employee.id === id
        );


    if (!selectedEmployee) {

        resetEmployee();

        return;

    }


    el.nik.textContent =
        selectedEmployee.nik;

    el.jabatan.textContent =
        selectedEmployee.jabatan;

    el.departemen.textContent =
        selectedEmployee.departemen;


    /*
     * Email karyawan tidak otomatis
     * dimasukkan sebagai email tujuan.
     *
     * Karena email tujuan adalah
     * email orang yang menerima surat.
     */


    updatePreview();

}


/* =========================================================
   RESET EMPLOYEE
========================================================= */

function resetEmployee() {

    el.nik.textContent = "-";

    el.jabatan.textContent = "-";

    el.departemen.textContent = "-";

    selectedEmployee = null;

    updatePreview();

}


/* =========================================================
   UPDATE PREVIEW
========================================================= */

function updatePreview() {

    const employee =
        selectedEmployee;


    if (!employee) {

        el.previewNama.textContent = "-";

        el.previewNik.textContent = "-";

        el.previewJabatan.textContent = "-";

        el.previewDepartemen.textContent = "-";

        el.previewNamaSignature.textContent = "-";

        el.previewJabatanSignature.textContent = "-";

        el.previewSignature.src = "";

    } else {

        el.previewNama.textContent =
            employee.nama;

        el.previewNik.textContent =
            employee.nik;

        el.previewJabatan.textContent =
            employee.jabatan;

        el.previewDepartemen.textContent =
            employee.departemen;

        el.previewNamaSignature.textContent =
            employee.nama;

        el.previewJabatanSignature.textContent =
            employee.jabatan;


        if (employee.signature) {

            el.previewSignature.src =
                employee.signature;

        }

    }


    const keperluan =
        getKeperluan();


    el.previewKeperluan.textContent =
        keperluan || "-";


    el.previewTanggal.textContent =
        formatTanggalRange(
            el.tanggalMulai.value,
            el.tanggalSelesai.value
        );


    el.previewKeterangan.textContent =
        el.keterangan.value ||
        "-";


    el.previewTanggalSurat.textContent =
        formatTanggal(
            getTodayISO()
        );

}


/* =========================================================
   KEPERLUAN
========================================================= */

function getKeperluan() {

    if (
        el.jenisIzin.value ===
        "Lainnya"
    ) {

        return (
            el.customKeperluan.value
                .trim()
        );

    }

    return el.jenisIzin.value;

}


/* =========================================================
   DATE
========================================================= */

function getTodayISO() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatTanggal(dateString) {

    if (!dateString) {

        return "-";

    }

    const date =
        new Date(
            dateString +
            "T00:00:00"
        );

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


function formatTanggalRange(
    start,
    end
) {

    if (!start) {

        return "-";

    }

    if (!end || start === end) {

        return formatTanggal(start);

    }

    return (
        formatTanggal(start) +
        " s/d " +
        formatTanggal(end)
    );

}


/* =========================================================
   TODAY
========================================================= */

function setTanggalHariIni() {

    el.tanggalHariIni.textContent =
        formatTanggal(
            getTodayISO()
        );

}


/* =========================================================
   VALIDASI
========================================================= */

function validateForm() {

    if (!selectedEmployee) {

        alert(
            "Silakan pilih karyawan."
        );

        return false;

    }


    if (!getKeperluan()) {

        alert(
            "Silakan isi keperluan izin."
        );

        return false;

    }


    if (!el.tanggalMulai.value) {

        alert(
            "Silakan pilih tanggal mulai."
        );

        return false;

    }


    if (!el.tanggalSelesai.value) {

        alert(
            "Silakan pilih tanggal selesai."
        );

        return false;

    }


    if (
        el.tanggalSelesai.value <
        el.tanggalMulai.value
    ) {

        alert(
            "Tanggal selesai tidak boleh sebelum tanggal mulai."
        );

        return false;

    }


    if (!el.keterangan.value.trim()) {

        alert(
            "Silakan isi keterangan."
        );

        return false;

    }


    return true;

}


/* =========================================================
   PDF
========================================================= */

async function createPDF() {

    updatePreview();

    // Tunggu tanda tangan selesai dimuat
    await waitForImages(el.surat);

    const canvas = await html2canvas(
        el.surat,
        {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff"
        }
    );

    const imgData = canvas.toDataURL(
        "image/jpeg",
        0.95
    );

    const {
        jsPDF
    } = window.jspdf;

    // ==============================
    // PDF A4 PORTRAIT
    // ==============================

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    // Ukuran A4
    const pageWidth = 210;
    const pageHeight = 297;

    // Margin PDF
    const margin = 10;

    // Lebar area isi
    const contentWidth =
        pageWidth - (margin * 2);

    // Rasio gambar
    const imgHeight =
        canvas.height *
        contentWidth /
        canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    // Halaman pertama
    pdf.addImage(
        imgData,
        "JPEG",
        margin,
        position,
        contentWidth,
        imgHeight
    );

    heightLeft -=
        pageHeight - (margin * 2);


    // Halaman berikutnya jika diperlukan
    while (heightLeft > 0) {

        position =
            heightLeft -
            imgHeight +
            margin;

        pdf.addPage(
            "a4",
            "portrait"
        );

        pdf.addImage(
            imgData,
            "JPEG",
            margin,
            position,
            contentWidth,
            imgHeight
        );

        heightLeft -=
            pageHeight - (margin * 2);
    }

    return pdf;
}


/* =========================================================
   DOWNLOAD PDF
========================================================= */

async function downloadPDF() {

    if (!validateForm()) {

        return;

    }


    showLoading(true);


    try {

        const pdf =
            await createPDF();


        const fileName =
            createFileName();


        pdf.save(
            fileName
        );


    } catch (error) {

        console.error(error);

        alert(
            "Gagal membuat PDF."
        );

    } finally {

        showLoading(false);

    }

}


/* =========================================================
   EMAIL
========================================================= */

async function sendEmail() {

    if (!validateForm()) {

        return;

    }


    const email =
        el.emailTujuan.value.trim();


    if (!email) {

        alert(
            "Silakan isi email tujuan."
        );

        return;

    }


    if (
        !CONFIG.EMAILJS_PUBLIC_KEY ||
        CONFIG.EMAILJS_PUBLIC_KEY ===
        "GANTI_PUBLIC_KEY"
    ) {

        alert(
            "EmailJS belum dikonfigurasi.\n\n" +
            "Isi Public Key, Service ID, dan Template ID di script.js."
        );

        return;

    }


    showLoading(true);


    try {

        const pdf =
            await createPDF();


        /*
         * Generate PDF menjadi Base64.
         */

        const pdfBase64 =
            pdf.output(
                "datauristring"
            );


        const fileName =
            createFileName();


        const templateParams = {

            to_email:
                email,

            nama:
                selectedEmployee.nama,

            nik:
                selectedEmployee.nik,

            jabatan:
                selectedEmployee.jabatan,

            departemen:
                selectedEmployee.departemen,

            keperluan:
                getKeperluan(),

            tanggal:
                formatTanggalRange(
                    el.tanggalMulai.value,
                    el.tanggalSelesai.value
                ),

            keterangan:
                el.keterangan.value,

            tanggal_surat:
                formatTanggal(
                    getTodayISO()
                ),

            attachment:
                pdfBase64,

            filename:
                fileName

        };


        await emailjs.send(

            CONFIG.EMAILJS_SERVICE_ID,

            CONFIG.EMAILJS_TEMPLATE_ID,

            templateParams

        );


        alert(
            "Surat berhasil dikirim melalui email."
        );


    } catch (error) {

        console.error(error);

        alert(
            "Gagal mengirim email.\n\n" +
            "Periksa konfigurasi EmailJS dan template email."
        );

    } finally {

        showLoading(false);

    }

}


/* =========================================================
   FILE NAME
========================================================= */

function createFileName() {

    const employee =
        selectedEmployee
            ?.nama
            ?.replace(
                /\s+/g,
                "-"
            )
            .toLowerCase()
        || "karyawan";


    const date =
        el.tanggalMulai.value ||
        getTodayISO();


    return `surat-izin-${employee}-${date}.pdf`;

}


/* =========================================================
   WAIT IMAGES
========================================================= */

function waitForImages(
    container
) {

    const images =
        Array.from(
            container.querySelectorAll(
                "img"
            )
        );


    return Promise.all(

        images.map(
            img => {

                if (
                    img.complete
                ) {

                    return Promise.resolve();

                }


                return new Promise(
                    resolve => {

                        img.onload =
                            resolve;

                        img.onerror =
                            resolve;

                    }
                );

            }
        )

    );

}


/* =========================================================
   LOADING
========================================================= */

function showLoading(
    status
) {

    if (status) {

        el.loading
            .classList
            .remove("hidden");

    } else {

        el.loading
            .classList
            .add("hidden");

    }

}
