import ImageLink from "./ImageLink";

export default function ProfilePicture({ imageUrl, userId, size }) {
    return (
        <div>
            <div className={` rounded-full w-[${size}px]`}>
                <ImageLink imageUrl={imageUrl}
                    linkUrl={"/profile/" + userId}
                    altText={"Foto de perfil de usuario"}
                    size={size}
                    rounded={true}
                ></ImageLink>
            </div>
        </div>
    )
}