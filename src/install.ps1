function getWTWebPath($path) {
  $parentDirectory = (Get-Item $path).Parent
  $parentDirectoryFullname = $parentDirectory.Fullname

  if ($parentDirectoryFullname -eq $null) {
    Write-Error "parentDirectoryFullname is null $path"
    exit 1
  }

  if (-not(Test-Path -Path $parentDirectoryFullname)) {
    Write-Error "Error occurs when trying access to $parentDirectoryFullname"
    exit 1
  }

  if ([string]$parentDirectory -eq "web") {
    return $parentDirectory.Fullname
  }

  return getWTWebPath($parentDirectoryFullname)
}

$wtWebPath = getWTWebPath($pwd)
$basePath = (Get-Item $wtWebPath).Parent.Parent.Fullname
$sourcePath = Join-Path "$basePath"  "source"
$sourceFilePath = Join-Path "$sourcePath" "api_ext.xml"
$sourceSampleFilePath = Join-Path "$sourcePath" "api_ext(sample).xml"
$indexXmlPath = Join-Path $pwd "index.xml"
$wtXmlUrl = ([string]$indexXmlPath).replace($wtWebPath, "").replace("\", "/")
$wtXmlUrl = "x-local://wt/web$wtXmlUrl"

if (-not(Test-Path -Path $sourceFilePath)) {
  if (-not(Test-Path -Path $sourceSampleFilePath)) {
    Write-Error "Example file $sourceSampleFilePath does not exist"
    exit 1
  }

  $sampleContent = [xml](Get-Content $sourceSampleFilePath)
  $sampleContent.save($sourceFilePath)
}

try {
  [xml]$sourceXmlDocument = Get-Content $sourceFilePath

  if ($null -eq $sourceXmlDocument) {
    throw
  }
}
catch {
  Write-Error "Can not read file $sourceFilePath"
  exit 1
}

foreach ($api in $sourceXmlDocument.api_ext.apis.api) {
  if ($api.name -eq "DAPI") {
    $api.ParentNode.RemoveChild($api) | Out-Null
  }
}

[xml]$dapiElement = @"
<api>
    <name>DAPI</name>
    <libs>
      <lib>
        <path>$wtXmlUrl</path>
      </lib>
    </libs>
  </api>
"@

$dapiNode = $sourceXmlDocument.ImportNode(($dapiElement).DocumentElement, $true)
$sourceXmlDocument.api_ext.apis.AppendChild($dapiNode) | Out-Null
$sourceXmlDocument.Save($sourceFilePath)

Write-Host "DAPI node successfully added to $sourceFilePath file"
