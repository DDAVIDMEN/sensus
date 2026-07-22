import Image from "next/image";

interface Sponsor {
  name: string;
  logo?: string;
}

const sponsors: Sponsor[] = [
  { name: "Patrocinador 1" },
  { name: "Patrocinador 2" },
  { name: "Patrocinador 3" },
  { name: "Patrocinador 4" },
  { name: "Patrocinador 5" },
  { name: "Patrocinador 6" },
  { name: "Patrocinador 7" },
  { name: "Patrocinador 8" },
  { name: "Patrocinador 9" },
  { name: "Patrocinador 10" },
];

export default function SponsorsFooter() {
  return (
    <footer className="sponsors-footer">
      <div className="sensus-container sponsors-footer-content">
        <p className="sponsors-footer-title">Con el apoyo de</p>

        <div className="sponsors-grid">
          {sponsors.map((sponsor) =>
            sponsor.logo ? (
              <div key={sponsor.name} className="sponsor-logo-card">
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  width={180}
                  height={80}
                  className="sponsor-logo-image"
                />
              </div>
            ) : (
              <div key={sponsor.name} className="sponsor-logo-card">
                <span>{sponsor.name}</span>
              </div>
            )
          )}
        </div>
      </div>
    </footer>
  );
}