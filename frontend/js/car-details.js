function formatNumber(n) {
  return Number(n).toLocaleString("fa-IR");
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return alert("شناسه خودرو نامعتبر است");

  const res = await fetch(`/api/cars/${id}`);
  const car = await res.json();

  if (!res.ok) return alert(car.error);

  // ------------------------------
  // Title & Breadcrumb
  // ------------------------------
  const fullName = `${car.brand} ${car.model} ${car.year}`;
  document.getElementById("page-title").innerText = fullName;
  document.getElementById("breadcrumb-name").innerText = fullName;

  document.getElementById("title-mobile").innerText = fullName;
  document.getElementById("title-desktop").innerText = fullName;

  document.getElementById("trim-mobile").innerText = car.trim || "";
  document.getElementById("trim-desktop").innerText = car.trim || "";

  // ------------------------------
  // Price
  // ------------------------------
  const priceFormatted = formatNumber(car.price);
  document.getElementById("price-mobile").innerText = priceFormatted;
  document.getElementById("price-desktop").innerText = priceFormatted;

  // ------------------------------
  // Description
  // ------------------------------
  document.getElementById("description").innerText =
    car.description || "بدون توضیحات";

  // ------------------------------
  // Specs → مشخصات فنی
  // ------------------------------
  document.getElementById("spec-mileage").innerText = car.mileage || "-";
  document.getElementById("spec-gearbox").innerText = car.gearbox || "-";
  document.getElementById("spec-fuel").innerText = car.fuel || "-";
  document.getElementById("spec-trim").innerText = car.trim || "-";
  document.getElementById("spec-color").innerText = car.color || "-";
  document.getElementById("spec-interior").innerText = car.interior_color || "-";
  document.getElementById("spec-body").innerText = car.body_condition || "-";
  document.getElementById("spec-engiine").innerText = car.engiine || "-";
  document.getElementById("spec-chassis").innerText = car.chassis || "-";
  document.getElementById("spec-origin").innerText = car.origin || "-";

  // ------------------------------
  // Gallery → گالری عکس
  // ------------------------------
  const images = car.images || [];
  const mainImage = document.getElementById("main-image");
  const thumbs = document.getElementById("thumbs");

  if (images.length > 0) {
    mainImage.style.backgroundImage = `url('${images[0]}')`;

    thumbs.innerHTML = "";
    images.forEach((img, index) => {
      const btn = document.createElement("button");
      btn.className =
        "w-24 aspect-video rounded-lg overflow-hidden border " +
        (index === 0 ? "border-primary" : "border-gray-300");

      btn.innerHTML = `
        <div class="w-full h-full bg-cover bg-center"
             style="background-image:url('${img}')"></div>
      `;

      btn.onclick = () => {
        mainImage.style.backgroundImage = `url('${img}')`;
      };

      thumbs.appendChild(btn);
    });
  }
});
