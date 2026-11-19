import topLeft from "@/assets/echowk-logo-tl.png";
import topRight from "@/assets/echowk-logo-tr.png";
import bottomLeft from "@/assets/echowk-logo-bl.png";
import bottomRight from "@/assets/echowk-logo-br.png";
import hub from "@/assets/echowk-logo-hub.png";

const parts = [
  { name: "tl", src: topLeft },
  { name: "tr", src: topRight },
  { name: "bl", src: bottomLeft },
  { name: "br", src: bottomRight },
  { name: "hub", src: hub },
];

export function AnimatedLogo() {
  return (
    <span className="brand-mark animated-logo" aria-hidden="true">
      {parts.map(({ name, src }) => (
        <img
          key={name}
          src={src}
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