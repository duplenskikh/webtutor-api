$basePath = "./../.."
$sourceFilePath = "$basePath/api_ext.xml"
$sourceSampleFilePath = "$basePath/api_ext(sample).xml"

if (-not(Test-Path -Path $sourceFilePath)) {
  if (-not(Test-Path -Path $sourceSampleFilePath)) {
    Write-Error "Файла с примером $sourceSampleFilePath не существует"
    exit 1
  }

  $sampleContent = [xml](get-content $sourceSampleFilePath)
  $sampleContent.save($sourceFilePath)
}

try {
  [xml]$sourceXmlDocument = Get-Content -Path $sourceFilePath | out-null

  if ($null -eq $sourceXmlDocument) {
    throw
  }
}
catch {
  Write-Error "Невозможно прочитать контент файла $sourceFilePath"
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
  Write-Host "DAPI уже добавлен в $sourceFilePath"
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
$sourceXmlDocument.api_ext.apis.AppendChild($dapiNode)
$sourceXmlDocument.Save($sourceFilePath)
