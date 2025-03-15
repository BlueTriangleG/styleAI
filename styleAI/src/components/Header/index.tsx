import "./Header.css";
import GradientText from "./GradientText";

export default function Header() {
  return (
    <div className="header">
      <div className="header-text">Generate Your Outfits Using </div>
      <GradientText
        colors={['#D4145A', '#FBB03B', '#D4145A', '#FBB03B', '#D4145A']}
      >STYLE-AI</GradientText>
    </div>
  )
}