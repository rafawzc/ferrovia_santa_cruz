#Requires -Version 5.1
$ErrorActionPreference = 'SilentlyContinue'
$ProgressPreference = 'SilentlyContinue'

$pendencias = @()
$bloqueios = @()

function Escrever-Titulo($texto) {
    Write-Host ''
    Write-Host $texto -ForegroundColor Cyan
    Write-Host ('-' * 64) -ForegroundColor DarkGray
}

function Escrever-Item($rotulo, $valor, $cor) {
    Write-Host ('  {0,-28}{1}' -f $rotulo, $valor) -ForegroundColor $cor
}

function Normalizar-Versao($texto) {
    $achado = [regex]::Match([string]$texto, '(\d+)\.(\d+)(?:\.(\d+))?')
    if (-not $achado.Success) { return $null }
    $partes = @($achado.Groups[1].Value, $achado.Groups[2].Value, '0')
    if ($achado.Groups[3].Success) { $partes[2] = $achado.Groups[3].Value }
    return [version]($partes -join '.')
}

function Versao-Do-Programa($executavel, $argumentos) {
    $comando = Get-Command $executavel -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $comando) { return $null }
    $saida = & $comando.Source @argumentos 2>&1 | Out-String
    return Normalizar-Versao $saida
}

function Conferir-Programa($nome, $executavel, $argumentos, $minima, $pacoteWinget, $obrigatorio) {
    $versao = Versao-Do-Programa $executavel $argumentos
    $alvo = Normalizar-Versao $minima
    if (-not $versao) {
        Escrever-Item $nome "nao instalado (minimo $minima)" 'Red'
        $script:pendencias += [pscustomobject]@{ Nome = $nome; Pacote = $pacoteWinget }
        if ($obrigatorio) { $script:bloqueios += "$nome nao esta instalado" }
        return
    }
    if ($versao -lt $alvo) {
        Escrever-Item $nome "$versao (precisa de $minima ou mais novo)" 'Yellow'
        $script:pendencias += [pscustomobject]@{ Nome = $nome; Pacote = $pacoteWinget }
        if ($obrigatorio) { $script:bloqueios += "$nome esta em $versao, abaixo do minimo $minima" }
        return
    }
    Escrever-Item $nome "$versao" 'Green'
}

function Porta-Livre($porta) {
    $ouvintes = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners()
    foreach ($ouvinte in $ouvintes) { if ($ouvinte.Port -eq $porta) { return $false } }
    return $true
}

Write-Host ''
Write-Host 'Diagnostico do PC - Ferrovia Santa Cruz (execucao sem Docker)' -ForegroundColor White

Escrever-Titulo 'Maquina'
$sistema = Get-CimInstance Win32_OperatingSystem
$processador = Get-CimInstance Win32_Processor | Select-Object -First 1
$disco = Get-CimInstance Win32_LogicalDisk -Filter ("DeviceID='" + $env:SystemDrive + "'")
$memoriaGb = [math]::Round($sistema.TotalVisibleMemorySize / 1MB, 1)
$discoGb = [math]::Round($disco.FreeSpace / 1GB, 1)
$administrador = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

Escrever-Item 'Windows' "$($sistema.Caption) build $($sistema.BuildNumber) ($env:PROCESSOR_ARCHITECTURE)" 'Gray'
Escrever-Item 'PowerShell' "$($PSVersionTable.PSVersion)" 'Gray'
Escrever-Item 'CPU' "$($processador.Name.Trim()) - $($processador.NumberOfLogicalProcessors) threads" 'Gray'

if ($memoriaGb -lt 4) {
    Escrever-Item 'Memoria RAM' "$memoriaGb GB (minimo 4 GB)" 'Red'
    $bloqueios += "RAM de $memoriaGb GB abaixo do minimo de 4 GB"
} elseif ($memoriaGb -lt 8) {
    Escrever-Item 'Memoria RAM' "$memoriaGb GB (roda apertado, 8 GB e o confortavel)" 'Yellow'
} else {
    Escrever-Item 'Memoria RAM' "$memoriaGb GB" 'Green'
}

if ($discoGb -lt 6) {
    Escrever-Item "Disco livre em $env:SystemDrive" "$discoGb GB (precisa de ~6 GB)" 'Red'
    $bloqueios += "apenas $discoGb GB livres, o setup pede cerca de 6 GB"
} else {
    Escrever-Item "Disco livre em $env:SystemDrive" "$discoGb GB" 'Green'
}

Escrever-Item 'Sessao administrador' $(if ($administrador) { 'sim' } else { 'nao (instaladores vao pedir elevacao)' }) $(if ($administrador) { 'Green' } else { 'Yellow' })

$caminhosLongos = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -Name LongPathsEnabled).LongPathsEnabled
Escrever-Item 'Caminhos longos' $(if ($caminhosLongos -eq 1) { 'habilitados' } else { 'desabilitados (node_modules pode falhar)' }) $(if ($caminhosLongos -eq 1) { 'Green' } else { 'Yellow' })

Escrever-Titulo 'Programas necessarios para rodar sem Docker'
Conferir-Programa 'Node.js' 'node' @('--version') '22.12' 'OpenJS.NodeJS.LTS' $true
Conferir-Programa 'npm' 'npm' @('--version') '10.0' 'OpenJS.NodeJS.LTS' $true
Conferir-Programa 'Python' 'python' @('--version') '3.13' 'Python.Python.3.13' $true
Conferir-Programa 'MySQL Server' 'mysql' @('--version') '8.0' 'Oracle.MySQL' $true

Escrever-Titulo 'Programas uteis, nao obrigatorios'
Conferir-Programa 'uv (gerenciador Python)' 'uv' @('--version') '0.9' 'astral-sh.uv' $false
Conferir-Programa 'Git' 'git' @('--version') '2.40' 'Git.Git' $false

Escrever-Titulo 'Como instalar o que falta'
$winget = Get-Command winget -ErrorAction SilentlyContinue
if ($winget) {
    Escrever-Item 'winget' 'disponivel' 'Green'
} else {
    Escrever-Item 'winget' 'ausente (instale o App Installer pela Microsoft Store)' 'Yellow'
}
if ($pendencias.Count -eq 0) {
    Write-Host '  Nada a instalar.' -ForegroundColor Green
} else {
    foreach ($pacote in ($pendencias.Pacote | Select-Object -Unique)) {
        Write-Host ("  winget install --id {0} -e --accept-package-agreements --accept-source-agreements" -f $pacote) -ForegroundColor White
    }
}

Escrever-Titulo 'Portas'
foreach ($porta in 5173, 8000, 3306) {
    $livre = Porta-Livre $porta
    $uso = switch ($porta) { 5173 { 'frontend (Vite)' } 8000 { 'backend (FastAPI)' } 3306 { 'MySQL' } }
    Escrever-Item "$porta - $uso" $(if ($livre) { 'livre' } else { 'ocupada' }) $(if ($livre) { 'Green' } else { 'Yellow' })
}

Escrever-Titulo 'Docker nesta maquina'
$docker = Get-Command docker -ErrorAction SilentlyContinue
$virtualizacao = (Get-CimInstance Win32_ComputerSystem).HypervisorPresent
Escrever-Item 'Docker' $(if ($docker) { 'instalado' } else { 'nao instalado' }) 'Gray'
Escrever-Item 'Virtualizacao/Hyper-V' $(if ($virtualizacao) { 'ativa (Docker Desktop viavel)' } else { 'inativa (Docker Desktop nao sobe)' }) 'Gray'

Escrever-Titulo 'Ajustes que o projeto exige para rodar sem Docker'
Write-Host '  1. frontend/vite.config.ts aponta o proxy /api para http://backend:8000 (nome de servico do Docker).' -ForegroundColor Gray
Write-Host '     Sem containers isso tem que virar http://127.0.0.1:8000.' -ForegroundColor Gray
Write-Host '  2. O backend le DB_HOST=db do .env; sem containers tem que virar 127.0.0.1.' -ForegroundColor Gray
Write-Host '  3. O banco nasce do db/script.sql, que o container do MySQL roda sozinho.' -ForegroundColor Gray
Write-Host '     Na mao: mysql -u root -p < db/script.sql.' -ForegroundColor Gray
Write-Host '  4. O fsc.py so fala com Docker. Sem containers, cada servico sobe a mao' -ForegroundColor Gray
Write-Host '     (uvicorn no backend, npm run dev no frontend).' -ForegroundColor Gray

Escrever-Titulo 'Veredito'
if ($bloqueios.Count -eq 0) {
    Write-Host '  O PC atende os requisitos para rodar o projeto sem Docker.' -ForegroundColor Green
    if ($pendencias.Count -gt 0) {
        Write-Host '  Ainda falta instalar os itens opcionais listados acima.' -ForegroundColor Yellow
    }
} else {
    Write-Host '  Pendencias que impedem rodar agora:' -ForegroundColor Red
    foreach ($bloqueio in $bloqueios) { Write-Host "    - $bloqueio" -ForegroundColor Red }
    Write-Host '  Resolva o que da (lista de winget acima) e rode este diagnostico de novo.' -ForegroundColor Yellow
}
Write-Host ''
