
const Address = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d306.4387420027422!2d107.99461384085659!3d-7.061785721986438!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68cbe38f9a2751%3A0xea0001ba0e3caf7d!2sSOTOYS_GRT!5e0!3m2!1sid!2sid!4v1782225211351!5m2!1sid!2sid"
function GoogleMapAddress() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl shadow-lg mt-8">
      <iframe
        title="Lokasi Toko"
        src={Address}
        className="w-full h-75 md:h-112.5"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
}

export default GoogleMapAddress;