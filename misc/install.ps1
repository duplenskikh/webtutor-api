$basePath = "./../../"
$sourceFilePath = "$basePath/api_ext.xml"

if (-not(Test-Path -Path $sourceFilePath)) {
  Write-Host "Файла не существует $sourceFilePath. Создаем."
  $sampleContent = [xml](get-content "$basePath/api_ext(sample).xml")
  $sampleContent.save($sourceFilePath)
}

try {
  [xml]$sourceXmlDocument = Get-Content -Path $sourceFilePath

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
