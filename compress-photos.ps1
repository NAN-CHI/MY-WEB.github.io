<#
    压缩照片.ps1
    ---------------------------------------------------------------------------
    把 img\ 下的照片压到适合网页的大小，减小仓库体积、让手机加载更快。

      长边最大 1400px，JPEG 质量 80
      只有「压完确实更小」时才覆盖原文件，所以可以反复运行
      建议每次加完新照片跑一次：双击 压缩照片.bat

    参数（一般不用改）：
      -MaxSide  长边像素，默认 1400
      -Quality  JPEG 质量，默认 80
#>
param(
    [int]$MaxSide = 1400,
    [int]$Quality = 80
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$imgDir = Join-Path $root 'img'

if (-not (Test-Path -LiteralPath $imgDir)) {
    Write-Host "找不到 img 目录：$imgDir"
    exit 1
}

Add-Type -AssemblyName System.Drawing

$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' }
if (-not $encoder) {
    Write-Host '没有找到 JPEG 编码器，无法压缩。'
    exit 1
}

$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)

$files = @(Get-ChildItem -LiteralPath $imgDir -Recurse -File -Include *.jpg, *.jpeg)
if ($files.Count -eq 0) {
    Write-Host 'img\ 里没有 jpg 照片。'
    exit 0
}

$before = 0
$after = 0
$changed = 0
$skipped = 0
$failed = 0

foreach ($f in $files) {
    $before += $f.Length

    try {
        $src = [System.Drawing.Image]::FromFile($f.FullName)
        $w = $src.Width
        $h = $src.Height

        # Already small enough? Leave it alone -- otherwise every run would
        # re-encode the JPEG and slowly lose quality.
        if ([Math]::Max($w, $h) -le $MaxSide -and $f.Length -le 400000) {
            $src.Dispose()
            $skipped++
            $after += $f.Length
            continue
        }

        $scale = [Math]::Min(1.0, $MaxSide / [Math]::Max($w, $h))
        $nw = [int][Math]::Max(1, [Math]::Round($w * $scale))
        $nh = [int][Math]::Max(1, [Math]::Round($h * $scale))

        $bmp = New-Object System.Drawing.Bitmap($nw, $nh)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.DrawImage($src, 0, 0, $nw, $nh)
        $g.Dispose()

        $src.Dispose()   # 先放开源文件，后面才能覆盖它

        $tmp = $f.FullName + '.tmp.jpg'
        $bmp.Save($tmp, $encoder, $encParams)
        $bmp.Dispose()

        $newLen = (Get-Item -LiteralPath $tmp).Length
        if ($newLen -lt $f.Length) {
            Move-Item -LiteralPath $tmp -Destination $f.FullName -Force
            $after += $newLen
            $changed++
        } else {
            Remove-Item -LiteralPath $tmp -Force
            $after += $f.Length
        }
    } catch {
        $failed++
        $after += $f.Length
        Write-Host ('跳过 {0}：{1}' -f $f.Name, $_.Exception.Message)
    }
}

$encParams.Dispose()

Write-Host ''
Write-Host ('完成：{0} 张照片，压缩了 {1} 张，已够小跳过 {2} 张，失败 {3} 张' -f $files.Count, $changed, $skipped, $failed)
Write-Host ('体积：{0:N1} MB -> {1:N1} MB' -f ($before / 1MB), ($after / 1MB))
if ($before -gt 0) {
    Write-Host ('省下：{0:N0}%' -f ((1 - $after / $before) * 100))
}
