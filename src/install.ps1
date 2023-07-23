$basePath = "$pwd/../../../source"
$sourceFilePath = "$basePath/api_ext.xml"
$sourceSampleFilePath = "$basePath/api_ext(sample).xml"

if (-not(Test-Path -Path $sourceFilePath)) {
  if (-not(Test-Path -Path $sourceSampleFilePath)) {
    Write-Error "Example file $sourceSampleFilePath does not exist"
    exit 1
  }

  $sampleContent = [xml](get-content $sourceSampleFilePath)
  $sampleContent.save($sourceFilePath)
}

try {
  [xml]$sourceXmlDocument = Get-Content -Path $sourceFilePath

  if ($null -eq $sourceXmlDocument) {
    throw
  }
}
catch {
  Write-Error "Can not read file $sourceFilePath"
  exit 1
}

function check($apis) {
  foreach ($api in $apis) {
    if ($api.name -eq "DAPI") {
      return $true
    }
  }

  return $false
}

$checkResult = check($sourceXmlDocument.api_ext.apis.api)

if ($checkResult -eq $true) {
  Write-Host "DAPI node already appended to file $sourceFilePath"
  exit 0
}

[xml]$dapiElement = @"
<api>
    <name>DAPI</name>
    <libs>
      <lib>
        <path>x-local://wt/web/dapi/index.xml</path>
      </lib>
    </libs>
  </api>
"@

$dapiNode = $sourceXmlDocument.ImportNode(($dapiElement).DocumentElement, $true)
$sourceXmlDocument.api_ext.apis.AppendChild($dapiNode) | Out-Null
$sourceXmlDocument.Save($sourceFilePath)

Write-Host "DAPI node successfully added to $sourceFilePath file"
