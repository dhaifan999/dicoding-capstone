"use strict";

const elemImage = document.getElementById("elemImage");
const elemPrediksi = document.getElementById("elemPrediksi");
const elemDetail = document.getElementById("elemDetail");

const renderImage = (input) => {
  // Menampilkan gambar yang diinputkan
  elemImage.src = window.URL.createObjectURL(input.files[0]);
}

/** MODEL HANDLER **/
let model = null;

(async () => {
  // Proses memuat model
  console.log("[Start] Memuat Model");
  model = await tf.loadLayersModel("tfjs-model/model.json");
  console.log("[Finish] Model Telah Dimuat");
})();

const label = [
  // ["Bacterial_Spot","Early_blight","Late_blight","Leaf_mold","Septoria_leaf_spot","Spider_mites Two_Spotted_spider_mite","Target_spot","Tomato_yellow_Leaf_Curl_Virus","Tomato_mosaic_virus","Healthy","Powdery_mildew"]
  "Bacterial_Spot",
  "Early_blight",
  "Late_blight",
  "Leaf_mold",
  "Septoria_leaf_spot",
  "Spider_mites Two_Spotted_spider_mite",
  "Target_spot",
  "Tomato_yellow_Leaf_Curl_Virus",
  "Tomato_mosaic_virus",
  "Healthy",
  "Powdery_mildew"
]

const predictImage = async () => {
  // 1) Cek dulu apakah model sudah dimuat atau belum
  if (model == null) {
    alert("Harap Tunggu, Model Belum Selesai Dimuat");
    return;
  }
  // Cek juga sebelum prediksi, gambar sudah diinputkan
  if (!elemImage.getAttribute('src')) {
    alert("Harap inputkan gambar terlebih dulu yaa");
    return;
  }
  // 2) Mengambil data gambar pada tag image yang telah dirender
  let tensor = tf.browser.fromPixels(elemImage);
  // 3) Menyesuaikan ukuran tensor dengan ukuran input pada model
  tensor = tensor.resizeNearestNeighbor([224, 224]);
  // 4) Lakukan normalisasi ukuran pixel dari (0, 255) -> (0, 1)
  tensor = tensor.div(tf.scalar(255));
  // 5) Sesuaikan dimensi tensor dengan dimensi input pada model
  // Contoh: dari [x] menjadi [[x]], x = tensor
  tensor = tensor.expandDims();
  // 6) Melakukan proses prediksi
  let dataPrediksi = await model.predict(tensor).data();
  dataPrediksi = Array.from(dataPrediksi).map((value, idx) => {
    return {
      class: label[idx],
      confidence: value
    }
  });
  
  // Mengurutkan hasil prediksi tinggi->rendah dari nilai confidence
  dataPrediksi.sort((x, y) => y.confidence - x.confidence);
  console.log(dataPrediksi);

  // 8) Menampilkan hasil prediksi
  // Menampilkan top-1 (nilai confidence tertinggi)
  elemPrediksi.innerHTML = dataPrediksi[0].class;
  // Menampilkan detail (opsional)
  let htmlData = "";
  dataPrediksi.forEach((data) => {
    htmlData += `<li>${data.class} &rarr; ${Math.round(data.confidence*100)}%</li>`;
  });
  elemDetail.innerHTML = htmlData;
}