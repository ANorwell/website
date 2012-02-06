server {
    listen   80;
    server_name  anorwell.com www.anorwell.com localhost;
    access_log  /var/log/nginx/anorwell.access.log;
    error_log  /var/log/nginx/anorwell.error.log;
    root   /www;

## Default location
    location / {
        index  index.html index.php;
    }

## Images and static content is treated different
    location ~* ^.+.(jpg|jpeg|gif|css|png|js|ico|xml)$ {
      access_log        off;
      expires           30d;
    }

## Parse all .php files in the /www directory
    location ~ .php$ {
        fastcgi_split_path_info ^(.+\.php)(.*)$;
        fastcgi_pass   php-backend;
        fastcgi_index  index.php;
        fastcgi_param  SCRIPT_FILENAME  /www$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_param  QUERY_STRING     $query_string;
        fastcgi_param  REQUEST_METHOD   $request_method;
        fastcgi_param  CONTENT_TYPE     $content_type;
        fastcgi_param  CONTENT_LENGTH   $content_length;
        fastcgi_intercept_errors        on;
        fastcgi_ignore_client_abort     off;
        fastcgi_connect_timeout 60;
        fastcgi_send_timeout 180;
        fastcgi_read_timeout 180;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;
        fastcgi_temp_file_write_size 256k;
    }

## Parse all .py files in the /www directory
    location ~ .py$ {
	uwsgi_pass py-backend;
        include uwsgi_params;
    }


## Disable viewing .htaccess & .htpassword
    location ~ /\.ht {
        deny  all;
    }
}

upstream php-backend {
	 server 127.0.0.1:9000;
}

upstream py-backend {
	 ip_hash;
	 server unix:/tmp/uwsgi.sock;
}
 
