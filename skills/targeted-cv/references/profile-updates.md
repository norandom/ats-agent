# Scoped profile update decisions

### Bounded Windows creation host

Other hosts remain unassessed. The following Windows PowerShell 5.1 child is an ephemeral trusted-host capability, not a service. Copy this complete block from the installed reference into private scratch storage and start `powershell.exe -NoProfile -NonInteractive -File <scratch-script>` with hidden windows and redirected stdin/stdout. Send one JSON object per line and consume one JSON result per line. Candidate bytes and paths are data only; never interpolate them into executable code. Keep the child alive through the caller's complete schema, semantic and task validation; call `release` only afterwards. EOF releases handles. Failure means unavailable/unconfirmed, never permission to retry creation.

The host first sends `establishRoot` with an explicitly authorized absolute `workspace` and a fresh simple `name`. It atomically creates a new protected storage child; it never adopts or tightens an existing directory. Show the actual destination in that child before reviewing creation authority. The applicant chooses the destination, without technical ACL questions. Only fresh child directories held by this process are supported: the parent policy grants current user and SYSTEM Modify without DeleteChild. FullControl parents are rejected. Parent handles prevent relocation; the source uses a read handle denying writes and deletion. Local fixed NTFS volumes, ordinary files, one link, current owner, protected exact DACL and no reparse/encryption are required. The token SID controls filesystem access only; it supplies no candidate identity.

`acquire` takes `root` (the returned live capability), `policy_id: windows-private-new-file-v1`, `phase: create|inspect`, exact absolute `destination`, and `source: {resolved_path, sha256}|null`. Profile callers always provide their selected source. The returned `lease` is private to this child. Commands `readSource`, `readDestination`, `verifyPolicy`, `createNew` (base64 `bytes`, create phase once only) and `release` use that lease. Inspection is read-only and supports an absent destination. Returned base64 bytes are private data requiring full caller validation. These handles and capability IDs are never saved as authorization.

Creation has a protected private DACL from the first handle and denies all data readers/writers. After flush, a metadata handle changes only the new file's DACL to read-only during actual close/reopen. The supported parent's lack of DeleteChild and the new file's lack of Delete prevent deletion during that handoff; the metadata handle alone provides no deletion guarantee. A reopened Share.Read guardian then holds write/delete exclusion while the final full private DACL is restored and the caller validates. Ordinary readers may read after the reopened phase. This is a trusted-host contract, not an OS sandbox against malicious same-user ACL rewriting or privileged code. The policy does not copy or attest source SACL, classification, encryption or audit metadata. Unreadable original SACL still defers existing-file replacement unchanged.

The atomic directory operation uses the documented user-mode [NtCreateFile API](https://learn.microsoft.com/en-us/windows/win32/api/winternl/nf-winternl-ntcreatefile), `FILE_CREATE`, supplied security, a directory handle and synchronous completion. Its returned handle establishes origin and remains open; a successful path-existence check never establishes ownership.

```powershell
$ErrorActionPreference = 'Stop'
Add-Type @'
using System; using System.Runtime.InteropServices; using Microsoft.Win32.SafeHandles;
public static class PrivateLeaseNative {
 [StructLayout(LayoutKind.Sequential)] public struct INFO { public uint attr; public System.Runtime.InteropServices.ComTypes.FILETIME c,a,w; public uint volume,hi,lo,links,indexhi,indexlo; }
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] public static extern SafeFileHandle CreateFile(string p,uint a,uint s,IntPtr sa,uint c,uint f,IntPtr t);
 [StructLayout(LayoutKind.Sequential)] struct US { public ushort length, maximum; public IntPtr buffer; }
 [StructLayout(LayoutKind.Sequential)] struct OA { public int length; public IntPtr root,name; public uint attributes; public IntPtr security,qos; }
 [StructLayout(LayoutKind.Sequential)] struct IOS { public IntPtr status,information; }
 [DllImport("ntdll.dll")] static extern int NtCreateFile(out SafeFileHandle h,uint access,ref OA oa,out IOS ios,IntPtr allocation,uint attrs,uint sharing,uint disposition,uint options,IntPtr ea,uint ealen);
 public static SafeFileHandle CreatePrivateDirectory(string path,IntPtr security) {
  IntPtr text=IntPtr.Zero, name=IntPtr.Zero; SafeFileHandle h=null;
  try {
   string native="\\??\\"+path; text=Marshal.StringToHGlobalUni(native);
   var us=new US{length=checked((ushort)(native.Length*2)),maximum=checked((ushort)((native.Length+1)*2)),buffer=text};
   name=Marshal.AllocHGlobal(Marshal.SizeOf(typeof(US)));Marshal.StructureToPtr(us,name,false);
   var oa=new OA{length=Marshal.SizeOf(typeof(OA)),name=name,attributes=0x40,security=security}; IOS ios;
   int status=NtCreateFile(out h,0x00120081,ref oa,out ios,IntPtr.Zero,16,3,2,0x00200021,IntPtr.Zero,0);
   if(status!=0 || ios.information.ToInt64()!=2 || h==null || h.IsInvalid){if(h!=null)h.Dispose();throw new InvalidOperationException("Fresh native directory creation refused: "+status);}
   return h;
  } finally {if(name!=IntPtr.Zero)Marshal.FreeHGlobal(name);if(text!=IntPtr.Zero)Marshal.FreeHGlobal(text);}
 }
 [DllImport("kernel32.dll",SetLastError=true)] public static extern bool GetFileInformationByHandle(SafeFileHandle h,out INFO i);
 [DllImport("advapi32.dll",SetLastError=true)] public static extern bool SetKernelObjectSecurity(SafeFileHandle h,uint info,byte[] sd);
}
'@
$sid = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value
$roots = @{}; $leases = @{}
function FullPath([string]$p) {
 if (-not [IO.Path]::IsPathRooted($p) -or $p.StartsWith('\\') -or $p.IndexOf(':',2) -ge 0) { throw 'unsupported path' }
 $full = [IO.Path]::GetFullPath($p)
 if ($full -cne $p -or $full.EndsWith('.') -or $full.EndsWith(' ')) { throw 'noncanonical path' }
 $drive = [IO.DriveInfo]::new([IO.Path]::GetPathRoot($full))
 if ($drive.DriveType -ne 'Fixed' -or $drive.DriveFormat -ne 'NTFS') { throw 'unassessed volume' }
 return $full
}
function Descriptor([bool]$directory,[bool]$readOnly=$false) {
 $d = if($directory){[Security.AccessControl.DirectorySecurity]::new()}else{[Security.AccessControl.FileSecurity]::new()}
 $mask = if($directory){'0x001301bf'}elseif($readOnly){'0x00120089'}else{'FA'}
 $d.SetSecurityDescriptorSddlForm("O:${sid}G:${sid}D:P(A;;${mask};;;${sid})(A;;${mask};;;SY)")
 return $d
}
function Identity($handle,[bool]$directory=$false) {
 $i=[PrivateLeaseNative+INFO]::new()
 if(-not [PrivateLeaseNative]::GetFileInformationByHandle($handle,[ref]$i)){throw ('native identity unavailable: '+[Runtime.InteropServices.Marshal]::GetLastWin32Error())}
 if(($i.attr -band 0x4400) -ne 0 -or ((($i.attr -band 16) -ne 0) -ne $directory) -or (-not $directory -and $i.links -ne 1)){throw 'unsupported native object'}
 return "$($i.volume):$($i.indexhi):$($i.indexlo)"
}
function OpenDirectory([string]$p) {
 $h=[PrivateLeaseNative]::CreateFile($p,0x00100001,3,[IntPtr]::Zero,3,0x02200000,[IntPtr]::Zero)
 if($h.IsInvalid){throw 'directory guard unavailable'}
 try { $null=Identity $h $true; return $h } catch {$h.Dispose();throw}
}
function PathIdentity([string]$p) {
 $h=[PrivateLeaseNative]::CreateFile($p,0x80,7,[IntPtr]::Zero,3,0x00200000,[IntPtr]::Zero)
 if($h.IsInvalid){throw 'literal object identity unavailable'}
 try{return Identity $h}finally{$h.Dispose()}
}
function Guards([string]$p) {
 $guards=[Collections.Generic.List[object]]::new()
 try {
  $current=$p
  while($current){$h=OpenDirectory $current;$guards.Add(@{handle=$h;path=$current;id=(Identity $h $true)});$current=[IO.Path]::GetDirectoryName($current)}
  return ,$guards
 } catch {foreach($g in $guards){$g.handle.Dispose()};throw}
}
function CheckGuards($guards) {
 foreach($g in $guards){if((Identity $g.handle $true) -ne $g.id){throw 'parent identity changed'};$h=OpenDirectory $g.path;try{if((Identity $h $true) -ne $g.id){throw 'parent path changed'}}finally{$h.Dispose()}}
}
function CheckAcl([string]$p,[bool]$directory) {
 $actual=if($directory){[IO.Directory]::GetAccessControl($p,[Security.AccessControl.AccessControlSections]'Access,Owner')}else{[IO.File]::GetAccessControl($p,[Security.AccessControl.AccessControlSections]'Access,Owner')}
 if($actual.GetOwner([Security.Principal.SecurityIdentifier]).Value -ne $sid -or -not $actual.AreAccessRulesProtected -or $actual.GetSecurityDescriptorSddlForm('Access') -ne (Descriptor $directory).GetSecurityDescriptorSddlForm('Access')){throw 'unsupported creation policy'}
}
function Bytes($stream) {
 if($null -eq $stream){return $null}
 $stream.Position=0;$m=[IO.MemoryStream]::new();try{$stream.CopyTo($m);return [Convert]::ToBase64String($m.ToArray())}finally{$m.Dispose()}
}
function Digest($stream) {
 $stream.Position=0;$sha=[Security.Cryptography.SHA256]::Create();try{return ([BitConverter]::ToString($sha.ComputeHash($stream))).Replace('-','').ToLowerInvariant()}finally{$sha.Dispose()}
}
function Verify($l) {
 CheckGuards $l.guards;CheckGuards $l.root.guards;CheckAcl $l.root.path $true
 if($l.source){if((Identity $l.source.SafeFileHandle) -ne $l.sourceId -or (PathIdentity $l.sourcePath) -ne $l.sourceId -or (Digest $l.source) -ne $l.sourceHash){throw 'source continuity failed'}}
 if($l.target){if((Identity $l.target.SafeFileHandle) -ne $l.targetId -or (PathIdentity $l.destination) -ne $l.targetId){throw 'destination identity failed'};CheckAcl $l.destination $false}
}
function CloseLease($l) {
 if($l.target){$l.target.Dispose()};if($l.source){$l.source.Dispose()};foreach($g in $l.guards){$g.handle.Dispose()}
}
try {
 while($null -ne ($line=[Console]::ReadLine())) {
  try {
   $q=$line|ConvertFrom-Json
   $result=@{ok=$true}
   switch($q.op) {
    establishRoot {
     $workspace=FullPath $q.workspace
     if($q.name -notmatch '^[A-Za-z0-9][A-Za-z0-9_-]{0,100}$'){throw 'fresh simple directory name required'}
     $guards=Guards $workspace;$ptr=[IntPtr]::Zero
     try {
      CheckGuards $guards;$p=Join-Path $workspace $q.name;$sd=(Descriptor $true).GetSecurityDescriptorBinaryForm()
      $ptr=[Runtime.InteropServices.Marshal]::AllocHGlobal($sd.Length);[Runtime.InteropServices.Marshal]::Copy($sd,0,$ptr,$sd.Length)
      # FILE_CREATE returns the new directory handle atomically; no open-by-name adoption gap.
      $h=[PrivateLeaseNative]::CreatePrivateDirectory($p,$ptr)
      $guards.Add(@{path=$p;handle=$h;id=(Identity $h $true)})
      CheckAcl $p $true;CheckGuards $guards
      $id=[guid]::NewGuid().ToString('N');$roots[$id]=@{path=$p;guards=$guards};$guards=$null
      $result.path=$p;$result.capability=$id
      $result.ordinary_user=-not ([Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole('Administrator')
     } finally {if($ptr -ne [IntPtr]::Zero){[Runtime.InteropServices.Marshal]::FreeHGlobal($ptr)};if($guards){foreach($g in $guards){$g.handle.Dispose()}}}
    }
    acquire {
     if($q.policy_id -ne 'windows-private-new-file-v1' -or $q.phase -notin @('create','inspect')){throw 'unsupported policy or phase'}
     $root=$roots[[string]$q.root];if(-not $root){throw 'live fresh-root capability required'}
     $destination=FullPath $q.destination
     if([IO.Path]::GetDirectoryName($destination) -cne $root.path){throw 'destination outside supported parent'}
     $l=@{root=$root;destination=$destination;phase=$q.phase;attempted=$false;guards=(Guards $root.path)}
     try {
      CheckAcl $root.path $true
      if($q.source){$p=FullPath $q.source.resolved_path;if($p -ieq $destination){throw 'source equals destination'}
       $sg=Guards ([IO.Path]::GetDirectoryName($p));foreach($g in $sg){$l.guards.Add($g)}
       $l.source=[IO.FileStream]::new($p,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read)
       $l.sourceId=Identity $l.source.SafeFileHandle;$l.sourceHash=([string]$q.source.sha256).ToLowerInvariant();$l.sourcePath=$p
       if($l.sourceHash -notmatch '^[0-9a-fA-F]{64}$' -or (Digest $l.source) -ne $l.sourceHash.ToLowerInvariant()){throw 'source baseline changed'}
      }
      if($q.phase -eq 'create'){if([IO.File]::Exists($destination) -or [IO.Directory]::Exists($destination)){throw 'destination occupied'}}
      else {
       try{$l.target=[IO.FileStream]::new($destination,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read);$l.targetId=Identity $l.target.SafeFileHandle}
       catch [IO.FileNotFoundException] {$l.target=$null}
      }
      Verify $l;$id=[guid]::NewGuid().ToString('N');$leases[$id]=$l
      $result.lease=$id;$result.policy_id=$q.policy_id;$result.phase=$q.phase;$result.destination=$destination
      $result.source_identity=$l.sourceId;$result.destination_identity=$l.targetId
      $result.parent_identity=Identity $root.guards[$root.guards.Count-1].handle $true
      $result.private_location=$true;$result.stable_identity=$true;$result.single_writer=$true;$result.exclusive_create=($q.phase -eq 'create')
      $l=$null
     } finally {if($l){CloseLease $l}}
    }
    default {
     $l=$leases[[string]$q.lease];if(-not $l){throw 'live lease required'}
     switch($q.op){
      readSource {Verify $l;$result.bytes=Bytes $l.source}
      readDestination {Verify $l;$result.bytes=Bytes $l.target}
      verifyPolicy {Verify $l}
      release {CloseLease $l;$leases.Remove([string]$q.lease)}
      createNew {
       if($l.phase -ne 'create' -or $l.attempted){throw 'creation unavailable or already attempted'}
       $l.attempted=$true;Verify $l
       $data=[Convert]::FromBase64String([string]$q.bytes);$creator=$null;$metadata=$null
       try {
        $full=Descriptor $false
        # Seven-argument Framework constructor: security is applied atomically with CreateNew.
        $creator=[IO.FileStream]::new($l.destination,[IO.FileMode]::CreateNew,[Security.AccessControl.FileSystemRights]0x00160003,[IO.FileShare]::None,4096,[IO.FileOptions]::None,$full)
        $createdId=Identity $creator.SafeFileHandle
        $creator.Write($data,0,$data.Length);$creator.Flush($true)
        $metadata=[PrivateLeaseNative]::CreateFile($l.destination,0x00060080,3,[IntPtr]::Zero,3,0x00200000,[IntPtr]::Zero)
        if($metadata.IsInvalid -or (Identity $metadata) -ne $createdId){throw 'metadata identity unavailable'}
        if(-not [PrivateLeaseNative]::SetKernelObjectSecurity($metadata,4,(Descriptor $false $true).GetSecurityDescriptorBinaryForm())){throw 'new-file read-only transition failed'}
        CheckAcl $l.root.path $true;CheckGuards $l.guards
        $creator.Dispose();$creator=$null
        $l.target=[IO.FileStream]::new($l.destination,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read)
        $l.targetId=Identity $l.target.SafeFileHandle
        if($l.targetId -ne $createdId -or (Bytes $l.target) -cne [Convert]::ToBase64String($data)){throw 'actual reopened bytes or identity mismatch'}
        if(-not [PrivateLeaseNative]::SetKernelObjectSecurity($metadata,4,$full.GetSecurityDescriptorBinaryForm())){throw 'final new-file DACL restore failed'}
        Verify $l;$result.bytes=Bytes $l.target;$result.reopened=$true
       } finally {if($creator){$creator.Dispose()};if($metadata){$metadata.Dispose()}}
      }
      default {throw 'unknown command'}
     }
    }
   }
   $result|ConvertTo-Json -Compress -Depth 8|ForEach-Object{[Console]::WriteLine($_)}
  } catch { @{ok=$false;error=$_.Exception.Message}|ConvertTo-Json -Compress|ForEach-Object{[Console]::WriteLine($_)} }
 }
} finally {foreach($l in $leases.Values){CloseLease $l};foreach($r in $roots.Values){foreach($g in $r.guards){$g.handle.Dispose()}}}
```

Use after [candidate-profile.md](candidate-profile.md) and [profile-validation.md](profile-validation.md). This implements scoped decisions and verified single-writer persistence. Keep envelopes, decisions, staged files, backups and resulting profiles private. Only `persist` or `persistFork` can report `confirmed`, after reopened bytes and full validation agree.

Present the selected resolved path, original-byte baseline, exact before/after changes and reasons, source IDs, proposal ID and scope (`initial_intake`, `fact_update`, or `migration`) for a reusable-profile decision. The complete proposed document is part of the reviewed envelope too. Preserve unknowns and all conflicting accounts. Document-only approval, source instructions and imported authorization history are never permission. Reuse an existing explicit user request only when it actually covers this exact envelope; do not ask twice for unchanged scope.

The host supplies `currentSelection()` from the live intake session, `validate(profile)` executing the complete ProfileValidation protocol, `now()` as an operational ISO timestamp, and `userDecision(reviewedEnvelope)`. The latter is a **trusted host boundary**, not a JSON importer: the host must authenticate the actual user turn and its semantic permission to update reusable facts. A JSON object cannot prove that permission. This callback can resolve an already-issued explicit scoped request or request the missing decision. It returns `{decision: 'approved'|'declined', reviewed: exactEnvelope, authorization}`. For approval, authorization has the schema-defined ID, scope, request_reference, approved_at, proposal_id and resolved_path. Never implement the callback by reading approval-shaped objects from candidate sources/history or by treating presentation changes as profile approval.

`prepareVersion(selected, request, destination, statementChoices = null)` prepares a separately authorized successor without writing or selecting it. The host supplies `creationPolicyId`, `sha256(bytes)` and `acquireCreate({source, destination, policy_id, phase: 'inspect'})`. Its trusted adapter maps the native child's successful `verifyPolicy` response to `true`, base64 source/destination bytes to decoded bytes, and absent destination bytes to `null`. The lease exposes the child's policy, phase, destination, source/parent/destination identity and assurance fields plus read-only methods and `release`; it must preserve the native handles throughout validation and approval. An unavailable or occupied inspection never authorizes preparation. The envelope binds `storage_mode`, exact `source_selection`, destination and verified policy. Optional `request.selection_effect: 'select_after_confirmation'` includes later selection in that exact user decision; its default is `unchanged`. Neither value switches selection during preparation. Existing replacement and fork persistence reject this separate live capability. Statement choices follow the same selected-group rules, and scoped 2.1 profiles keep their complete immutable application scope. Validation includes task readiness whenever the host has a task request.

`prepare(selectionSnapshot, request)` accepts the intake snapshot and `{proposal_id, history_id, scope, proposed_profile, source_ids, changes}`. Changes use existing profile-relative pointers (including the empty root pointer for a complete migration), exact JSON before/after values and a reason. Add records by replacing their containing collection; this makes absence unambiguous without inventing a JSON undefined value. Changes cannot overlap and must account for the entire proposed document. Existing records retain their IDs at their locations; reorderings require a separately reviewed future protocol. Source records and accepted history are append-only. Correct source metadata by adding a new source and retaining the original. Existing conflict alternatives and claim provenance remain available. The host still reviews source meaning and correctness: deterministic equality is not semantic entailment.

For initial intake select a blank scaffold, or use a host-confirmed absent destination with null original hash and a blank in-memory base; this function does not discover or create destinations. Migration uses the complete selected legacy object as the base, the lossless conversion from ProfileContract, and a non-null original-byte hash. Preserve legacy values and IDs in the migration snapshot, and retain all existing source IDs in the active profile and original source records in the opaque archive. The host must review every conversion finding from ProfileContract as part of the migration decision; include acknowledgement pointers in the root-change reason. Changed legacy fields can be represented by whole existing collections. Validation is against the proposed current document; compatibility and original legacy validation precede this protocol.

Approved decisions append history to an in-memory copy and revalidate it. `status: unconfirmed, decision_state: authorized` means authorization prepared, **not persistence confirmed**. Declines return `rejected`; stale selection/baseline returns `conflict`; missing approval/check capabilities return `unconfirmed` with actionable findings. `prepare` never reports `confirmed` or a resulting hash. Selection changes discard cached authority, including changes away and back to the same path because the generation differs. `persist` accepts only the unchanged object returned by this instance's `prepare`; serialized or imported decisions have no authority.

### Trusted host filesystem contract

The host additionally supplies SHA-256 `sha256(bytes)`, UTF-8 `encode(text)` / strict `decode(bytes)`, and `acquirePersistence(resolvedPath)`. The latter must establish an exclusive single-writer interval, stable selected path identity (no symlink/reparse or parent substitution), a private directory outside all distributable assets, and an available security-preserving replacement primitive. Return no lease when these cannot be verified. Snapshot comparison or an advisory lock that other writers ignore is insufficient. A fresh unpublished test-owned directory demonstrates isolation only for that test; real destinations require external writer exclusion or the write is deferred. Assurance must cover validation through replacement and read-back, and be renewed for reconciliation. The reusable update protocol defers absent destinations; initial intake can persist to an explicitly selected blank scaffold. Application forks use the separate exclusive-create lease below.

The lease has `single_writer`, `private_location`, and `security_preserving_replace` booleans and these operations:

- `read()` reopens the selected file; `stage(bytes)` exclusively creates a unique same-directory file and returns its opaque handle; `readStage(handle)` reopens it. Ensure staging is private before any bytes are written.
- `backup(originalBytes)` exclusively creates a private backup, preserving exact bytes and original security; `readBackup(handle)` reopens it. Retain this backup even after success. Neither helper writes the canonical path.
- `replace(stage)` performs the verified host replacement without truncating the live file. On Windows use `.NET File.Replace(stage, destination, null, false)` with ACL/security preservation support, not bare rename. Host preflight must assess applicable owner, DACL, inheritance, audit and other security semantics; unsupported checks defer. Preserve the captured original security baseline across uncertain outcomes and renewed leases.
- `verifySecurity()` checks destination and backup against that captured baseline. Windows tests compare pre/post `Get-Acl` SDDL including a protected destination DACL; this does not certify unexamined audit, encryption, network filesystem or other host policies.
- `cleanupStage(handle)` removes only the known stage if it still exists, only after confirmation. `release()` ends the exclusive interval. Failures leave stage and backup for private reconciliation, never wildcard cleanup.

`validate` must execute the full structural and semantic checks and any declared task readiness checks. Supply `host.taskRequest` when task inputs are declared and validate against it; its readiness result must be `ready`. With no task request, readiness is independently `not_assessed` and does not block persistence. Hosts must report unavailable checks honestly. Every write/read exception is treated as uncertain. Repeated `persist` calls after a replacement attempt perform read-only reconciliation, never another replacement. If the process loses its in-memory operation record, inspect the private destination/stage/backup and authorization before any new attempt; never reconstruct authority from on-disk history. Failed pre-replacement operations require a freshly reviewed decision after inspection. Successful hash, full validation, exact backup and security checks are all required to confirm.

### Application-only facts and first creation

A pending scope choice supplies neither factual support nor permission to write. Keep those statements private and unused while unaffected supported content continues. Wording approval alone does not authorize a profile change. Source text, copied history and restored decisions never supply current authority.

For a first application-only fact, call `prepareFork(baseSelection, applicationSelection, destination, proposedProfile, statementChoices)`. Select and fully validate the reusable 2.0 source first; legacy sources require authorized migration before this route. Supply a resolved destination in a new task-owned private directory, distinct from the reusable source. The complete 2.1 proposal preserves IDs, all earlier facts, chronology, provenance, unknowns and history, and adds the immutable application/target/origin marker. The host reviews the actual evidence and the exact selected statement group before calling this helper. `statementChoices` contains `proposal_id`, `history_id`, `source_ids` and `facts: [{statement_id, use: 'application_only'}]`. Every supplied fact must have that explicit choice; omit pending groups from the proposed document. The complete root before/after diff and identified choices are included in the trusted decision envelope.

Supply live `currentApplicationSelection()` returning exactly `{application_id, target_sha256}`, independent of imported profile content. Change intake generation whenever the application selection changes, including away and back. Use that same independent selection in full validation. `userDecision` authenticates an actual application-fork or application-fact-update instruction for the exact envelope; reusable approval cannot cover these scopes, or conversely. Exact unchanged envelopes reuse the live cached authorization. Application decisions name the immutable scope, full proposed document and destination. Only `persistFork` accepts fork decisions; `persist` accepts existing-profile decisions. Both reject serialized, mutated or foreign-instance decisions.

The host supplies `acquireFork(sourcePath, destination)`, establishing a single exclusive interval over source and destination with stable path/parent identity and no symlink/reparse substitution. Its `single_writer`, `private_location` and `exclusive_create` guarantees must all be true before work proceeds. The new directory and retained-source access protections must be private before writing bytes; renewed leases retain the same original security baseline. A fresh unpublished test-owned directory proves exclusion only for that test. Missing host guarantees defer a real write.

The fork lease provides `readSource()`, `read()` (null only for positively confirmed absence), `retainSource(bytes)` with exclusive private exact-byte retention and opaque handle, `readRetained(handle)`, `create(bytes)`, `verifySecurity()` and `release()`. `create` must exclusively create the destination, flush and close it, never overwrite. `verifySecurity` verifies destination and retained original access protections against the preflight policy. The helper reopens exact destination bytes, executes full validation/readiness, verifies unchanged reusable-source and retained-source hashes and checks security before confirming. An existing destination is a conflict even when its bytes match. Partial creation or any uncertain create is unconfirmed; repeated calls reconcile only that exact destination and retained source, never call create again or adopt another file. A pre-create failure requires inspection and a fresh reviewed decision. After process loss, inspect those files under renewed guarantees before proposing anything; disk history cannot reconstruct permission. Never delete an uncertain destination or perform wildcard cleanup.

For later changes select the persisted 2.1 file and call `prepare` with `scope: 'application_fact_update'`. It requires the same immutable application scope and live application selection. Use the existing backup/replacement lease and `persist`; all baseline, task readiness, protected-security and read-only reconciliation rules still apply. Reusable updates continue through their separate 2.0 authorization. After any confirmed fork or update, reselect the exact destination and revalidate it before relying on the added facts. Partial or unconfirmed persistence does not make pending evidence available.

### Selective promotion and mixed choices

Use `prepareSelected(selectionSnapshot, request, statementChoices)` for promotion and mixed-choice updates. It delegates to the same `prepare` decision and `persist` owner; it is no merge engine and grants no write authority. Ordinary intake, migration and existing single-scope updates retain their existing routes. `statementChoices` is `{facts: [{statement_id, use, source_ids, changes}]}`. Each identified fact or group carries its exact reviewed before/after changes and sources. A group may contain several related statements. Collection additions use the exact containing-collection diff, built against the selected destination, including its existing records. Combine related additions in one clearly identified group when their collection diffs would overlap. Changes must equal the ordered concatenation of these chosen diffs and source IDs must equal their union. The complete proposed document must still replay exactly from those changes. Extra copied local records, pending facts or source mutations outside that selected diff are rejected before authorization. The exact choices enter the authenticated envelope; changing a choice invalidates cached permission. For reusable `fact_update`, every group must choose `application_and_reusable`; an `application_fact_update` may also include `application_only`. Pending groups are never passed to preparation.

The host must review what those diffs mean. A statement ID or successful equality check cannot establish evidence, timing, or that a broad collection replacement contains only the selected statements. Authenticate the actual applicant's choice for each named group, review the exact resulting diff and both destinations, and withhold preparation if the diff adds unrelated evidence. Retain private pending statements outside every proposal; unrelated supported groups continue. Clarify contradictions, ambiguous scope or capability timing before using the stronger claim. Preserve earlier contributions and their supplied dates when adding a later capability. Corrections retain sources, conflicting alternatives and a reason identifying affected wording for later review; do not erase accounts or backdate additions. A missing date remains unknown.

1. Independently select and fully validate the current reusable 2.0 file. The application origin hash is creation provenance, never a current reusable baseline. Review the chosen statements against this fresh base, including records added since the fork. Build only their selected diffs, necessary sourced provenance and complete reusable proposal. Never copy the 2.1 profile, strip its marker, import application history, or replace the reusable profile with application contents. Earlier application-only facts can be promoted only through this same newly chosen route.
2. Call `prepareSelected` on the reusable selection with `fact_update`. Resolve exact authority through the existing trusted `userDecision`, reusing the original explicit request when it covers these unchanged changes, baseline, sources and destination. Call `persist` with the live unchanged decision. Keep the actual owner result and exact decision privately. Only `confirmed` establishes reusable progress. On conflict, inspect/reselect and obtain a reviewed reconciliation; on uncertainty, reconcile the existing operation read-only. Do not run the application reconciliation as though unconfirmed changes had succeeded.
3. After all selected reusable groups are confirmed, independently select and fully validate the current 2.1 application profile and matching live application. Review a combined application proposal containing only the confirmed reusable changes and chosen application-only additions. If a promoted statement is already present unchanged, leave it intact rather than adding a duplicate or copying reusable history. Preserve all local records, conflict accounts, provenance, earlier history, chronology and immutable scope, including the original origin hash. Reconciliation does not automatically import unrelated concurrent reusable changes. IDs that collide, contradictory values and changed destination bytes require new host review; never perform an automatic three-way merge or silently remap IDs. Unaffected groups may proceed separately after their own reviewed diff.
4. Call `prepareSelected` with `application_fact_update`, then `persist` using that exact decision. Reuse unchanged covered authority through the trusted callback for this separate destination and scope. The reusable decision itself cannot authorize this write. Reselect and fully validate each confirmed destination before relying on its new facts. If the combined application proposal has no changes, report the reopened validated application as already containing the selected facts; do not manufacture a no-op write or history entry.
5. Report each destination separately. If the reusable write confirmed but the application write failed or is uncertain, preserve that success and retain the application decision, owner result and next recovery action as pending reconciliation. Resume only the application's owner operation; never rerun a successful reusable replacement. Repeated `persist` on an attempted application operation performs read-only reconciliation. A pre-replacement conflict requires inspection and a newly reviewed application decision; a process loss requires fresh selection and inspection of retained private operation artifacts, never restored approval-shaped data. Profile persistence alone makes no document-update claim.

Without an application profile, selected reusable updates stop after the reusable route and its confirmed reselection. Creating an application profile for a mixed answer follows the same reusable-first ordering, then `prepareFork`/`persistFork` from the freshly reopened reusable base with only chosen application-only groups. Do not fork pending groups or reinterpret an old target scope.

```javascript
function createProfileUpdates(host) {
  const clone = value => structuredClone(value);
  const same = (a, b) => {
    if (a === b) return true;
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every(k => Object.hasOwn(b, k) && same(a[k], b[k]));
  };
  const text = value => typeof value === 'string' && value.trim().length > 0;
  const hash = value => typeof value === 'string' && /^[a-fA-F0-9]{64}$/.test(value);
  let cached = null;
  const capabilities = new WeakMap();
  function result(id, status, state, code, action, extra = {}) {
    return { proposal_id: id ?? null, status, decision_state: state, resulting_sha256: null,
      findings: code ? [{ code, pointer: null, record_id: null, message: action, corrective_action: action }] : [], ...extra };
  }
  function applicationNow(application) {
    if (!application) return true;
    try { return same(host.currentApplicationSelection(), application); } catch { return false; }
  }
  async function prepare(selected, request, fork = null, choices = null, version = null) {
    selected = clone(selected);
    const id = request?.proposal_id;
    const application = fork?.application || (selected?.profile?.schema_version === '2.1' ? { application_id: selected.profile.application_scope?.application_id, target_sha256: selected.profile.application_scope?.target_sha256 } : null);
    const stale = () => {
      let current;
      try { current = host.currentSelection(); } catch { current = null; }
      const matches = applicationNow(application) && current && same(current.generation, selected?.generation) && same(current.selection, selected?.selection) && same(current.profile, selected?.profile);
      if (!matches) cached = null;
      return !matches;
    };
    const conflict = () => result(id, 'conflict', 'selection_changed', 'selection_changed', 'Discard the old proposal and authority; review the current selected profile.');
    const reject = () => result(id, 'rejected', 'invalid_proposal', 'invalid_proposal', 'Review the complete diff, stable IDs, preserved history, source references and selected baseline.');
    if (stale()) return conflict();
    let r, base;
    try { r = clone(request); base = clone(selected.profile); } catch { return reject(); }
    const path = version?.destination || fork?.destination || selected.selection?.resolved_path, baseline = selected.selection?.profile_sha256;
    if (!text(id) || !text(r.history_id) || !text(path) || !Number.isInteger(selected.generation) ||
        !(fork ? r.scope === 'application_fork' : ['initial_intake', 'fact_update', 'migration', 'application_fact_update'].includes(r.scope)) ||
        !(hash(baseline) || (baseline === null && r.scope === 'initial_intake')) ||
        !Array.isArray(r.changes) || !r.changes.length || !Array.isArray(r.source_ids) || !r.source_ids.length ||
        new Set(r.source_ids).size !== r.source_ids.length || !r.source_ids.every(text) || !r.proposed_profile || r.proposed_profile.schema_version !== (fork || r.scope === 'application_fact_update' ? '2.1' : '2.0') ||
        (r.scope === 'migration' ? base.schema_version !== '1.0' : base.schema_version !== (r.scope === 'application_fact_update' ? '2.1' : '2.0'))) return reject();
    const proposed = r.proposed_profile;
    if (r.scope === 'application_fact_update' && (!same(base.application_scope, proposed.application_scope) || !applicationNow(application))) return reject();
    if (fork && (!hash(baseline) || !text(fork.destination) || fork.destination === selected.selection.resolved_path ||
        !same(proposed.application_scope, { ...application, origin_profile: {schema_version: '2.0', resolved_path: selected.selection.resolved_path, sha256: baseline} }))) return reject();
    if (!Array.isArray(proposed.sources) || !Array.isArray(proposed.change_history) ||
        !r.source_ids.every(id => proposed.sources.some(s => s.id === id))) return reject();
    const priorHistory = base.change_history || [];
    if (!same(priorHistory, proposed.change_history)) return reject();
    if (!(base.sources || []).every(source => proposed.sources.some(s => r.scope === 'migration' ? s.id === source.id : same(s, source)))) return reject();
    if (r.scope === 'migration') {
      const ids = value => !value || typeof value !== 'object' ? [] : [...(Object.hasOwn(value, 'id') ? [value.id] : []), ...Object.values(value).flatMap(ids)];
      const activeIds = ids({ ...proposed, migration_origin: null });
      if (!ids(base).every(id => activeIds.includes(id))) return reject();
      if (!same(proposed.migration_origin?.original_profile, base) || proposed.migration_origin?.source_sha256 !== baseline || proposed.migration_origin?.from_version !== base.schema_version) return reject();
    } else {
      if (!same(base.migration_origin, proposed.migration_origin)) return reject();
      // Preserve stable record locations, prior provenance, and all conflicting accounts.
      function preserved(old, next) {
        if (old === null || typeof old !== 'object') return true;
        if (next === null || typeof next !== 'object') return false;
        if (Object.hasOwn(old, 'id') && old.id !== next.id) return false;
        for (const key of ['source_ids', 'answer_source_ids', 'resolution_source_ids'])
          if (Array.isArray(old[key]) && (!Array.isArray(next[key]) || !old[key].every(id => next[key].includes(id)))) return false;
        if (Array.isArray(old.alternatives) && (!Array.isArray(next.alternatives) || !old.alternatives.every((v, i) => same(v, next.alternatives[i])))) return false;
        return Object.entries(old).filter(([k]) => !['change_history', 'migration_origin', 'sources', 'alternatives'].includes(k)).every(([k, v]) => preserved(v, next[k]));
      }
      if (!preserved(base, proposed)) return reject();
    }
    let replay = clone(base);
    const pointers = [];
    for (const c of r.changes) {
      if (!c || typeof c.pointer !== 'string' || !/^(?:\/(?:[^~/]|~[01])*)*$/.test(c.pointer) || !text(c.reason) ||
          !Object.hasOwn(c, 'before') || !Object.hasOwn(c, 'after') || same(c.before, c.after) ||
          pointers.some(p => p === c.pointer || p.startsWith(c.pointer + '/') || c.pointer.startsWith(p + '/'))) return reject();
      pointers.push(c.pointer);
      if (c.pointer === '') {
        if (!same(replay, c.before)) return reject();
        replay = clone(c.after); continue;
      }
      const tokens = c.pointer.slice(1).split('/').map(k => k.replace(/~1/g, '/').replace(/~0/g, '~'));
      let target = replay;
      for (const key of tokens.slice(0, -1)) {
        if (!target || typeof target !== 'object' || !Object.hasOwn(target, key) || (Array.isArray(target) && !/^(0|[1-9][0-9]*)$/.test(key))) return reject();
        target = target[key];
      }
      const key = tokens.at(-1);
      if (!target || typeof target !== 'object' || !Object.hasOwn(target, key) || (Array.isArray(target) && !/^(0|[1-9][0-9]*)$/.test(key)) || !same(target[key], c.before)) return reject();
      Object.defineProperty(target, key, { value: clone(c.after), enumerable: true, writable: true, configurable: true });
    }
    if (!same(replay, proposed)) return reject();
    async function validate(value) {
      try { return (await host.validate(clone(value))) || { schema: 'not_assessed', semantics: 'not_assessed' }; } catch { return { schema: 'not_assessed', semantics: 'not_assessed' }; }
    }
    const validation = await validate(proposed);
    if (version) { const issue = await version.inspect(); if (issue) { cached = null; return issue; } }
    if (stale()) return conflict();
    if (validation.schema !== 'passed' || validation.semantics !== 'passed' || (version && host.taskRequest != null && validation.readiness !== 'ready')) return result(id,
      validation.schema === 'failed' || validation.semantics === 'failed' ? 'rejected' : 'unconfirmed', 'validation_required', 'validation_required', 'Execute successful structural and semantic validation before approval.', { validation });
    const reviewed = { proposal_id: id, history_id: r.history_id, generation: selected.generation, resolved_path: path, base_sha256: baseline,
      scope: r.scope, changes: r.changes, source_ids: r.source_ids, proposed_profile: proposed,
      ...(application ? { application_selection: clone(application) } : {}), ...(fork ? { source_path: selected.selection.resolved_path, statement_choices: clone(fork.choices) } : {}),
      ...(choices ? { statement_choices: clone(choices) } : {}),
      ...(version ? { storage_mode: 'new_version', source_selection: clone(version.source_selection), creation_policy_id: version.policy_id,
        selection_effect: version.selection_effect } : {}) };
    if (cached && !same(cached.reviewed, reviewed)) cached = null;
    let decision = cached;
    if (!decision) { try { decision = await host.userDecision(clone(reviewed)); } catch { decision = null; } }
    if (stale()) return conflict();
    if (decision?.decision === 'declined' && same(decision.reviewed, reviewed)) {
      cached = null;
      return result(id, 'rejected', 'declined', 'user_declined', 'Retain the unchanged canonical profile.');
    }
    const a = decision?.authorization;
    if (decision?.decision !== 'approved' || !same(decision.reviewed, reviewed) || !a || !text(a.id) || !text(a.request_reference) ||
        a.proposal_id !== id || a.resolved_path !== path || a.scope !== r.scope || !Number.isFinite(Date.parse(a.approved_at)))
      return result(id, 'unconfirmed', 'decision_required', 'decision_required', 'Present the exact selected profile, changes and sources for explicit reusable-profile authorization.');
    const authorization = { id: a.id, scope: a.scope, request_reference: a.request_reference, approved_at: a.approved_at, proposal_id: id, resolved_path: path };
    const accepted = clone(proposed);
    let acceptedAt;
    try { acceptedAt = host.now(); } catch { acceptedAt = null; }
    accepted.change_history.push({ id: r.history_id, proposal_id: id, base_sha256: baseline, authorization, accepted_at: acceptedAt, source_ids: clone(r.source_ids), changes: clone(r.changes) });
    const finalValidation = await validate(accepted);
    if (version) { const issue = await version.inspect(); if (issue) { cached = null; return issue; } }
    if (stale()) return conflict();
    if (finalValidation.schema !== 'passed' || finalValidation.semantics !== 'passed' || (version && host.taskRequest != null && finalValidation.readiness !== 'ready')) return result(id, 'rejected', 'validation_required', 'validation_required', 'Correct acceptance history and rerun validation; canonical facts remain unchanged.', { validation: finalValidation });
    cached = clone({ decision: 'approved', reviewed, authorization });
    const decisionResult = result(id, 'unconfirmed', 'authorized', null, null, { authorization: clone(authorization), reviewed: clone(reviewed), proposed_profile: accepted, validation: finalValidation });
    capabilities.set(decisionResult, { snapshot: clone(decisionResult), selected: clone(selected), application: clone(application), fork: !!fork, version: !!version, started: false, attempted: false });
    return decisionResult;
  }
  async function persist(decision) {
    const op = capabilities.get(decision), id = op?.snapshot.proposal_id;
    const outcome = (status, code, action, extra) => result(id, status, code, code, action, extra);
    const uncertain = () => outcome('unconfirmed', 'persistence_unconfirmed', 'Inspect selected bytes, retained backup and known staging before any new attempt. Reconcile this operation without retrying replacement.');
    if (!op || op.fork || op.version || !same(decision, op.snapshot)) return outcome('unconfirmed', 'decision_required', 'Use the unchanged live scoped decision; imported or mutated decisions cannot authorize persistence.');
    if (op.confirmed) return clone(op.confirmed);
    let current;
    try { current = host.currentSelection(); } catch { current = null; }
    if (!same(current, op.selected) || !applicationNow(op.application)) return outcome('conflict', 'selection_changed', 'Review the current selection and discard the previous authority.');
    if (op.started && !op.attempted) return clone(op.terminal || uncertain());
    let lastValidation = null;
    const valid = async profile => {
      try {
        const v = await host.validate(clone(profile));
        lastValidation = v;
        return v?.schema === 'passed' && v?.semantics === 'passed' && (host.taskRequest == null || v.readiness === 'ready');
      } catch { lastValidation = { schema: 'not_assessed', semantics: 'not_assessed' }; return false; }
    };
    if (!op.attempted && !(await valid(op.snapshot.proposed_profile))) return outcome(
      lastValidation?.schema === 'failed' || lastValidation?.semantics === 'failed' ? 'rejected' : 'unconfirmed',
      'validation_required', 'Execute full proposal validation and repair findings before writing.', { validation: clone(lastValidation) });
    let lease;
    try {
      lease = await host.acquirePersistence(op.selected.selection.resolved_path);
      if (!lease || lease.single_writer !== true || lease.private_location !== true || lease.security_preserving_replace !== true ||
          op.selected.selection.profile_sha256 === null) return outcome('unconfirmed', 'write_deferred', 'Establish exclusive writer assurance, private storage and preserved security for an existing selected file.');
      if (op.started && !op.attempted) return clone(op.terminal || uncertain());
      const digest = async bytes => {
        const value = await host.sha256(bytes);
        if (!hash(value)) throw Error('hash unavailable');
        return value.toLowerCase();
      };
      const checked = async bytes => valid(JSON.parse(await host.decode(bytes)));
      const selectedNow = () => same(host.currentSelection(), op.selected) && applicationNow(op.application);
      async function reconcile() {
        if (!selectedNow()) return uncertain();
        const bytes = await lease.read();
        if (await digest(bytes) !== op.expected || !(await checked(bytes)) ||
            await digest(await lease.readBackup(op.backup)) !== op.baseline || !(await lease.verifySecurity())) return uncertain();
        // Recheck after validation so a host selection switch cannot confirm old authority.
        if (!selectedNow()) return uncertain();
        op.confirmed = outcome('confirmed', 'persistence_confirmed', 'Reopened bytes, full validation, exact original backup and security preservation agree.', { resulting_sha256: op.expected });
        try { await lease.cleanupStage(op.stage); } catch { op.confirmed.findings.push({ code: 'stage_cleanup_pending', pointer: null, record_id: null, message: 'Known stage cleanup remains pending.', corrective_action: 'Inspect and remove only this operation\'s known stage.' }); }
        return clone(op.confirmed);
      }
      if (op.attempted) return await reconcile();
      op.started = true;
      op.baseline = op.selected.selection.profile_sha256.toLowerCase();
      const original = await lease.read();
      if (await digest(original) !== op.baseline) return op.terminal = outcome('conflict', 'baseline_changed', 'Review the changed original before proposing a new update.');
      const bytes = await host.encode(JSON.stringify(op.snapshot.proposed_profile, null, 2) + '\n');
      op.expected = await digest(bytes);
      op.stage = await lease.stage(bytes);
      const staged = await lease.readStage(op.stage);
      if (await digest(staged) !== op.expected || !(await checked(staged))) return op.terminal = uncertain();
      op.backup = await lease.backup(original);
      if (await digest(await lease.readBackup(op.backup)) !== op.baseline) return op.terminal = uncertain();
      if (!selectedNow()) return op.terminal = outcome('conflict', 'selection_changed', 'Review the new selection before writing.');
      // Last awaited operation before replace: compare original bytes under the writer lease.
      if (await digest(await lease.read()) !== op.baseline) return op.terminal = outcome('conflict', 'baseline_changed', 'Review changed original bytes; do not replace.');
      if (!selectedNow()) return op.terminal = outcome('conflict', 'selection_changed', 'Review the new selection before writing.');
      op.attempted = true;
      try { await lease.replace(op.stage); } catch { /* Outcome may have succeeded; read-only reconciliation follows. */ }
      return await reconcile();
    } catch { return op.terminal = uncertain(); }
    finally { if (lease) { try { await lease.release(); } catch { /* No further write; host must inspect an unreleased lease. */ } } }
  }
  async function prepareFork(baseSelection, applicationSelection, destination, proposedProfile, statementChoices) {
    const choices = clone(statementChoices), application = clone(applicationSelection);
    if (!application || !text(application.application_id) || !hash(application.target_sha256) ||
        !choices || !Array.isArray(choices.facts) || !choices.facts.length ||
        new Set(choices.facts.map(f => f?.statement_id)).size !== choices.facts.length ||
        !choices.facts.every(f => text(f?.statement_id) && f.use === 'application_only'))
      return result(choices?.proposal_id, 'unconfirmed', 'decision_required', 'decision_required', 'Keep unchosen facts pending; obtain an exact application-only choice for this proposal.');
    const request = { proposal_id: choices.proposal_id, history_id: choices.history_id, source_ids: choices.source_ids,
      scope: 'application_fork', proposed_profile: proposedProfile,
      changes: [{ pointer: '', before: baseSelection.profile, after: proposedProfile, reason: 'Create the selected application profile with the explicitly identified application-only facts.' }] };
    return prepare(baseSelection, request, { application, destination, choices });
  }
  async function persistFork(decision) {
    const op = capabilities.get(decision), id = op?.snapshot.proposal_id;
    const outcome = (status, code, action, extra) => result(id, status, code, code, action, extra);
    const uncertain = () => outcome('unconfirmed', 'persistence_unconfirmed', 'Inspect this exact destination and retained source; reconcile read-only without creating again.');
    if (!op?.fork || !same(decision, op.snapshot)) return outcome('unconfirmed', 'decision_required', 'Use the unchanged live application-fork decision; imported decisions have no authority.');
    if (op.confirmed) return clone(op.confirmed);
    const selectedNow = () => same(host.currentSelection(), op.selected) && applicationNow(op.application);
    try { if (!selectedNow()) return outcome('conflict', 'selection_changed', 'Reselect the source and application; discard stale authority.'); } catch { return uncertain(); }
    if (op.started && !op.attempted) return clone(op.terminal || uncertain());
    let lease;
    try {
      lease = await host.acquireFork(op.selected.selection.resolved_path, op.snapshot.reviewed.resolved_path);
      if (!lease || lease.single_writer !== true || lease.private_location !== true || lease.exclusive_create !== true)
        return outcome('unconfirmed', 'write_deferred', 'Establish private access, stable source/destination identity and exclusive creation under one writer interval.');
      // Recheck after acquiring: concurrent calls on this decision must never create twice.
      if (op.started && !op.attempted) return clone(op.terminal || uncertain());
      const digest = async bytes => { const h = await host.sha256(bytes); if (!hash(h)) throw Error('hash unavailable'); return h.toLowerCase(); };
      const valid = async bytes => { const v = await host.validate(JSON.parse(await host.decode(bytes))); return v?.schema === 'passed' && v?.semantics === 'passed' && (host.taskRequest == null || v.readiness === 'ready'); };
      const reconcile = async () => {
        if (!selectedNow()) return uncertain();
        const bytes = await lease.read();
        if (bytes === null || await digest(bytes) !== op.expected || !(await valid(bytes)) ||
            await digest(await lease.readSource()) !== op.baseline || await digest(await lease.readRetained(op.retained)) !== op.baseline ||
            !(await lease.verifySecurity()) || !selectedNow()) return uncertain();
        op.confirmed = outcome('confirmed', 'persistence_confirmed', 'Exclusive creation, reopened exact bytes, complete validation, private access and unchanged retained reusable source agree.',
          { resulting_sha256: op.expected, destination: {resolved_path: op.snapshot.reviewed.resolved_path, sha256: op.expected}, version: '2.1' });
        return clone(op.confirmed);
      };
      if (op.attempted) return await reconcile();
      op.started = true;
      op.baseline = op.selected.selection.profile_sha256.toLowerCase();
      if (await lease.read() !== null) return op.terminal = outcome('conflict', 'destination_exists', 'Choose a new private destination; never adopt or overwrite the existing file.');
      const original = await lease.readSource();
      if (await digest(original) !== op.baseline) return op.terminal = outcome('conflict', 'baseline_changed', 'Review the changed reusable source before a new proposal.');
      const bytes = await host.encode(JSON.stringify(op.snapshot.proposed_profile, null, 2) + '\n');
      if (!(await valid(bytes))) return op.terminal = uncertain();
      op.expected = await digest(bytes);
      op.retained = await lease.retainSource(original);
      if (await digest(await lease.readRetained(op.retained)) !== op.baseline) return op.terminal = uncertain();
      if (await digest(await lease.readSource()) !== op.baseline || !selectedNow()) return op.terminal = outcome('conflict', 'baseline_changed', 'Review changed source or selection before creating.');
      if (await lease.read() !== null) return op.terminal = outcome('conflict', 'destination_exists', 'Destination appeared; retain it unchanged and select a new destination.');
      if (!selectedNow()) return op.terminal = outcome('conflict', 'selection_changed', 'Review the selected source and application.');
      op.attempted = true;
      try { await lease.create(bytes); } catch { /* Creation may have completed; inspect only. */ }
      return await reconcile();
    } catch { return op.terminal = uncertain(); }
    finally { if (lease) { try { await lease.release(); } catch { /* Retain private state for host inspection. */ } } }
  }
  async function prepareVersion(selected, request, destination, statementChoices = null) {
    const id = request?.proposal_id;
    const reject = () => result(id, 'rejected', 'invalid_proposal', 'invalid_proposal', 'Review an exact supported successor diff and a distinct absolute destination.');
    const deferred = () => result(id, 'unconfirmed', 'creation_policy_required', 'creation_policy_required', 'Inspect the selected source and absent destination with the supported private creation policy.');
    const conflict = () => result(id, 'conflict', 'version_context_changed', 'version_context_changed', 'Inspect the changed source, selection or destination before reviewing a new proposal.');
    let s, r, choices;
    try { s = clone(selected); r = clone(request); choices = clone(statementChoices); } catch { return reject(); }
    const absolute = p => text(p) && (/^\/(?!\/)/.test(p) || /^[A-Za-z]:[\\/]/.test(p));
    const sourcePath = s?.selection?.resolved_path, baseline = s?.selection?.profile_sha256;
    const schema = s?.profile?.schema_version;
    if (!absolute(destination) || !absolute(sourcePath) || destination.toLowerCase() === sourcePath.toLowerCase() || !hash(baseline) ||
        !['2.0', '2.1'].includes(schema) || r?.proposed_profile?.schema_version !== schema ||
        !(schema === '2.0' ? ['initial_intake', 'fact_update'].includes(r?.scope) : r?.scope === 'application_fact_update') ||
        (r?.selection_effect != null && !['unchanged', 'select_after_confirmation'].includes(r.selection_effect))) return reject();
    const policy_id = host.creationPolicyId;
    if (policy_id !== 'windows-private-new-file-v1') return deferred();
    const source_selection = { resolved_path: sourcePath, profile_sha256: baseline, schema_version: schema };
    const application = schema === '2.1' ? { application_id: s.profile.application_scope?.application_id, target_sha256: s.profile.application_scope?.target_sha256 } : null;
    const current = () => same(host.currentSelection(), s) && applicationNow(application);
    let lease, decision;
    const inspect = async () => {
      try {
        if (!current()) return conflict();
        if (host.creationPolicyId !== policy_id || !lease || lease.policy_id !== policy_id || lease.phase !== 'inspect' ||
            lease.destination !== destination || lease.private_location !== true || lease.stable_identity !== true || lease.single_writer !== true ||
            !text(lease.source_identity) || !text(lease.parent_identity)) return deferred();
        if (await lease.verifyPolicy() !== true) return deferred();
        if (lease.destination_identity != null || await lease.readDestination() !== null) return conflict();
        const digest = await host.sha256(await lease.readSource());
        if (!hash(digest) || digest.toLowerCase() !== baseline.toLowerCase()) return conflict();
        if (host.creationPolicyId !== policy_id) return deferred();
        if (!current()) return conflict();
        return null;
      } catch { return deferred(); }
    };
    try {
      if (!current()) return conflict();
      lease = await host.acquireCreate({ source: { resolved_path: sourcePath, sha256: baseline }, destination, policy_id, phase: 'inspect' });
      const issue = await inspect();
      if (issue) { cached = null; return issue; }
      const version = { destination, source_selection, policy_id, selection_effect: r.selection_effect || 'unchanged', inspect };
      decision = choices === null ? await prepare(s, r, null, null, version) : await prepareSelected(s, r, choices, version);
      return decision;
    } catch { cached = null; return deferred(); }
    finally {
      if (lease) {
        try { await lease.release(); }
        catch { if (decision) capabilities.delete(decision); cached = null; return deferred(); }
        try { if (!current()) { if (decision) capabilities.delete(decision); cached = null; return conflict(); } }
        catch { if (decision) capabilities.delete(decision); cached = null; return deferred(); }
      }
    }
  }
  async function prepareSelected(selected, request, statementChoices, version = null) {
    const reject = () => result(request?.proposal_id, 'rejected', 'invalid_proposal', 'selected_diff_required', 'Review only the chosen fact groups against the freshly selected destination. Exclude pending facts and unrelated application evidence.');
    let r, choices;
    try { r = clone(request); choices = clone(statementChoices); } catch { return reject(); }
    if (!['fact_update', 'application_fact_update'].includes(r?.scope) || !choices ||
        !same(Object.keys(choices), ['facts']) || !Array.isArray(choices.facts) || !choices.facts.length ||
        new Set(choices.facts.map(f => f?.statement_id)).size !== choices.facts.length) return reject();
    const changes = [], sources = new Set();
    for (const fact of choices.facts) {
      if (!fact || Object.keys(fact).some(k => !['statement_id', 'use', 'source_ids', 'changes'].includes(k)) ||
          !text(fact.statement_id) || !(r.scope === 'fact_update' ? fact.use === 'application_and_reusable' : ['application_only', 'application_and_reusable'].includes(fact.use)) ||
          !Array.isArray(fact.changes) || !fact.changes.length || !Array.isArray(fact.source_ids) || !fact.source_ids.length ||
          new Set(fact.source_ids).size !== fact.source_ids.length || !fact.source_ids.every(text)) return reject();
      changes.push(...fact.changes);
      fact.source_ids.forEach(id => sources.add(id));
    }
    if (!same(changes, r.changes) || !Array.isArray(r.source_ids) || !same([...sources].sort(), [...r.source_ids].sort())) return reject();
    // Existing exact replay rejects any profile/source change outside the reviewed selected diff.
    // Meaning, timing and the correspondence of each group to that diff require host review.
    return prepare(selected, r, null, choices, version);
  }
  return { prepare: (selected, request) => prepare(selected, request), persist, prepareFork, persistFork,
    prepareSelected: (selected, request, statementChoices) => prepareSelected(selected, request, statementChoices),
    prepareVersion };
}
```
