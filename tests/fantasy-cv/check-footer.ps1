param([Parameter(Mandatory=$true)][string]$Document)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $Document))
try {
    $footers = @($archive.Entries | Where-Object FullName -Match '^word/footer\d+\.xml$')
    if ($footers.Count -eq 0) { throw 'No DOCX footer found' }
    foreach ($entry in $footers) {
        $reader = [IO.StreamReader]::new($entry.Open())
        try { [xml]$xml = $reader.ReadToEnd() } finally { $reader.Dispose() }
        $ns = [Xml.XmlNamespaceManager]::new($xml.NameTable)
        $ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
        $codes = @($xml.SelectNodes('//w:instrText', $ns) | ForEach-Object { $_.InnerText.Trim() })
        $codes += @($xml.SelectNodes('//w:fldSimple', $ns) | ForEach-Object { $_.GetAttribute('instr',$ns.LookupNamespace('w')).Trim() })
        if ('PAGE' -notin $codes -or 'NUMPAGES' -notin $codes) { throw 'Expected dynamic PAGE and NUMPAGES fields' }
    }
    Write-Output 'PASS dynamic PAGE and NUMPAGES footer fields'
} finally { $archive.Dispose() }
