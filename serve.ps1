$root = 'C:\Users\beyza\Documents\Default Project'
$l = New-Object Net.HttpListener
$l.Prefixes.Add('http://localhost:8791/')
$l.Start()
while ($l.IsListening) {
  $c = $l.GetContext()
  $p = $c.Request.Url.LocalPath.TrimStart('/')
  if ([string]::IsNullOrEmpty($p)) { $p = 'index.html' }
  $f = Join-Path $root ($p -replace '/', '\')
  if (Test-Path $f -PathType Leaf) {
    $b = [IO.File]::ReadAllBytes($f)
    $c.Response.OutputStream.Write($b, 0, $b.Length)
  } else {
    $c.Response.StatusCode = 404
  }
  $c.Response.Close()
}
