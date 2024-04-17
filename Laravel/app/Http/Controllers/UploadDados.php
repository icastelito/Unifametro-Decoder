<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UploadDados extends Controller
{
    public function upload(Request $request)

    {
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();

            if ($extension != 'dat') {
                return redirect('/')->with('error', 'O arquivo deve ser .dat');
            }

            $filename = $file->getClientOriginalName();
            $file->storeAs('data/in', $filename);

            return view('upload');
            return redirect('/')->with('success', 'Arquivo enviado com sucesso.');
        }

        return redirect('/')->with('error', 'Nenhum arquivo foi enviado.');
    }
}
