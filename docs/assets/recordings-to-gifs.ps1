param(
    [Parameter(Mandatory=$true)][string]$RecordingDirectory,
    [Parameter(Mandatory=$true)][string]$FFmpeg
)

# Rebuild README previews from the retained window-only MP4 recordings.
# Keep actual timing, scale for README display, and reuse one palette per clip.
$filter = 'fps=4,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=3'
foreach ($name in @('mib-cv-live', 'mib-cover-letter-live')) {
    $source = Join-Path $RecordingDirectory "$name.mp4"
    $destination = Join-Path $PSScriptRoot "$name.gif"
    if (-not (Test-Path -LiteralPath $source)) { throw "Missing recording: $source" }
    & $FFmpeg -hide_banner -loglevel error -y -i $source -filter_complex $filter -loop 0 $destination
    if ($LASTEXITCODE -ne 0) { throw "GIF conversion failed: $name" }
}
