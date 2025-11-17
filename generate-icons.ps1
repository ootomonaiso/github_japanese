Add-Type -AssemblyName System.Drawing

function New-Icon {
    param(
        [string]$Path,
        [int]$Size,
        [int]$R,
        [int]$G,
        [int]$B
    )

    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = 'AntiAlias'

    $color = [System.Drawing.Color]::FromArgb(255, $R, $G, $B)
    $brush = New-Object System.Drawing.SolidBrush($color)
    $graphics.FillRectangle($brush, 0, 0, $Size, $Size)

    $fontSize = [Math]::Max(8, [Math]::Round($Size * 0.58))
    $font = New-Object System.Drawing.Font("Meiryo UI", $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = 'Center'
    $format.LineAlignment = 'Center'

    $graphics.DrawString("あ", $font, $textBrush, (New-Object System.Drawing.RectangleF(0, 0, $Size, $Size)), $format)

    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)

    $format.Dispose()
    $textBrush.Dispose()
    $font.Dispose()
    $brush.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
}

New-Icon -Path "icons/icon16.png" -Size 16 -R 57 -G 183 -B 92
New-Icon -Path "icons/icon48.png" -Size 48 -R 46 -G 160 -B 67
New-Icon -Path "icons/icon128.png" -Size 128 -R 31 -G 111 -B 235
