Add-Type -AssemblyName System.Drawing
$assets = 'C:\Users\beyza\Documents\Default Project\assets'
$orig = Join-Path $assets 'orig'
if (-not (Test-Path $orig)) { New-Item -ItemType Directory $orig | Out-Null }
$files = Get-ChildItem (Join-Path $assets 'ss-*.jpg')
foreach ($f in $files) {
  $backup = Join-Path $orig $f.Name
  if (-not (Test-Path $backup)) { Copy-Item $f.FullName $backup }
  $src = [Drawing.Image]::FromFile($f.FullName)
  $cw = [int]($src.Width * 0.92); $ch = [int]($src.Height * 0.92)
  $cx = [int](($src.Width - $cw) / 2); $cy = [int](($src.Height - $ch) / 2)
  $bmp = New-Object Drawing.Bitmap($cw, $ch)
  $g = [Drawing.Graphics]::FromImage($bmp)
  $cm = New-Object Drawing.Imaging.ColorMatrix
  $cm.Matrix00 = 1.05; $cm.Matrix11 = 1.0; $cm.Matrix22 = 1.08
  $cm.Matrix40 = -0.02; $cm.Matrix41 = -0.02; $cm.Matrix42 = -0.015
  $attr = New-Object Drawing.Imaging.ImageAttributes
  $attr.SetColorMatrix($cm)
  $g.DrawImage($src, (New-Object Drawing.Rectangle(0, 0, $cw, $ch)), $cx, $cy, $cw, $ch, [Drawing.GraphicsUnit]::Pixel, $attr)
  $font = New-Object Drawing.Font('Courier New', [int]($ch * 0.028), [Drawing.FontStyle]::Bold)
  $txt = 'INKBORN'
  $sz = $g.MeasureString($txt, $font)
  $brush = New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(150, 232, 220, 195))
  $g.DrawString($txt, $font, $brush, ($cw - $sz.Width - $cw * 0.03), ($ch - $sz.Height - $ch * 0.035))
  $brush.Dispose(); $font.Dispose(); $attr.Dispose(); $g.Dispose(); $src.Dispose()
  $tmp = $f.FullName + '.new.jpg'
  $enc = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $par = New-Object Drawing.Imaging.EncoderParameters(1)
  $par.Param[0] = New-Object Drawing.Imaging.EncoderParameter([Drawing.Imaging.Encoder]::Quality, 88)
  $bmp.Save($tmp, $enc, $par)
  $bmp.Dispose(); $par.Dispose()
  Move-Item $tmp $f.FullName -Force
  Write-Output ("done " + $f.Name)
}
