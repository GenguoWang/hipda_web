<?php
function resize_image($file,$w, $h, $crop=FALSE,$mime="") {
    $info = getimagesize($file);
    $width = $info[0];
    $height = $info[1];
    if(!$mime) $mime = $info["mime"];
    $r = $width / $height;
    $newwidth = $width;
    $newheight = $height;
    if($newwidth > $w || $height > $h){
        if ($crop) {
            if ($width > $height) {
                $width = ceil($width-($width*abs($r-$w/$h)));
            } else {
                $height = ceil($height-($height*abs($r-$w/$h)));
            }
            $newwidth = $w;
            $newheight = $h;
        } else {
            if ($w/$h > $r) {
                $newwidth = $h*$r;
                $newheight = $h;
            } else {
                $newheight = $w/$r;
                $newwidth = $w;
            }
        }
    }
    if($mime=="image/jpeg")$src = imagecreatefromjpeg($file);
    else if($mime=="image/png")$src = imagecreatefrompng($file);
    else $src = imagecreatefromjpeg($file);
    $dst = imagecreatetruecolor($newwidth, $newheight);
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $newwidth, $newheight, $width, $height);
    return $dst;
}
?>
