import { Link } from "react-router-dom";

export default function ImageLink({ imageUrl, linkUrl, altText, size, rounded, props }) {
    return (
        <div>
            <Link to={linkUrl}>
                <div className="flex">
                    <img src={imageUrl} alt={altText} width={size} height={size} className={rounded ? "rounded-full" : "rounded-lg"} />
                    {props && props}
                </div>
            </Link>
        </div>
    )
}