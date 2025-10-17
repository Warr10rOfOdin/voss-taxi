Param([string]$Manifest="patches\ALL-setup.json",[switch]$Dry=$false)
if($Dry){ node tools\vt\patcher.cjs $Manifest --dry } else { node tools\vt\patcher.cjs $Manifest }
