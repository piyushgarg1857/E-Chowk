import topLeft from "@/assets/echowk-logo-tl.png.asset.json";
import topRight from "@/assets/echowk-logo-tr.png.asset.json";
import bottomLeft from "@/assets/echowk-logo-bl.png.asset.json";
import bottomRight from "@/assets/echowk-logo-br.png.asset.json";
import hub from "@/assets/echowk-logo-hub.png.asset.json";

const parts = [
  { name: "tl", asset: topLeft },
  { name: "tr", asset: topRight },
  { name: "bl", asset: bottomLeft },
  { name: "br", asset: bottomRight },
  { name: "hub", asset: hub },
];

export function AnimatedLogo() {
  return (
    <span className="brand-mark animated-logo" aria-hidden="true">
      {parts.map(({ name, asset }) => (
        <img
          key={name}
          src={asset.url}
          className={`logo-part logo-part-${name}`}
          alt=""
          width={509}
          height={514}
          draggable={false}
        />
      ))}
    </span>
  );
}